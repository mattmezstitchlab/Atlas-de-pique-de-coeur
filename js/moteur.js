/* Le moteur : il reconstruit une demande à partir des mots de la personne.
   1. Il découpe le texte en demandes (phrases, « puis », « ensuite », « et aussi »…).
   2. Dans chacune, il reconnaît l’intention, la forme, le verbe, l’objet, pour qui, quand, où, combien, les conditions et la forme du résultat.
   3. Il les range : d’abord l’ordre que la personne a dit elle-même, puis l’urgence, puis l’ordre où elle l’a dit.
   4. Il les présente toujours dans la même grille, et dit ce qui manque.
   analyser(texte) est une fonction pure (aucun accès à la page) ; l’affichage est plus bas. */
(function () {
  var L = window.ATLAS.lexique, S = window.ATLAS.statistiques;

  /* ---- normaliser sans perdre les positions : un caractère pour un caractère ---- */
  function norm(s) {
    var o = '';
    for (var i = 0; i < s.length; i++) {
      var c = s[i] === '’' ? "'" : s[i].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      o += c.length === 1 ? c : s[i].toLowerCase();
    }
    return o;
  }
  var lettre = function (c) { return !!c && /[a-z0-9]/.test(c); };
  /* toutes les occurrences d’une expression, en mots entiers */
  function trouver(t, p) {
    var r = [], i = t.indexOf(p);
    while (i !== -1) {
      if (!lettre(t[i - 1]) && !lettre(t[i + p.length])) r.push([i, i + p.length]);
      i = t.indexOf(p, i + 1);
    }
    return r;
  }
  var MOIS = 'janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre';
  var JOURS_SEM = { lundi: 1, mardi: 1, mercredi: 1, jeudi: 1, vendredi: 1, samedi: 1, dimanche: 1 };
  var PRIORITE_INTENTION = ['soutien', 'ecriture', 'technique', 'image', 'conseil', 'information', 'expression'];
  var VERBE_PAR_DEFAUT = { conseil: 'Savoir', information: 'Savoir', ecriture: 'Écrire', technique: 'Régler', image: 'Créer', expression: 'Dire', soutien: 'Être écouté' };
  var MARQUEURS_DECOUPE = ['d\'abord', 'ensuite', 'puis', 'et aussi', 'et apres', 'apres ca', 'enfin', 'pour finir', 'en dernier', 'en premier', 'avant tout'];
  var ARRETS_OBJET = /^(pour|avant|apres|a|au|aux|en|sans|avec|dans|d'ici|le|budget|pas|maximum|max|moins|plus|si|sous|chez|qui|que|car|parce|mais|et|ou|ce|cette|demain|aujourd'hui)$/;
  var PRONOMS = /^(moi|nous|me|m'|-moi|lui|leur|toi|vous|-nous|svp|stp|s'il)$/;

  /* ---- découper le texte en demandes, en gardant les positions ---- */
  function decouper(texte) {
    var t = norm(texte), coupes = [0], m, re = /[.!?;\n]+/g;
    while ((m = re.exec(t))) coupes.push(m.index + m[0].length);
    MARQUEURS_DECOUPE.forEach(function (p) {
      trouver(t, p).forEach(function (o) {
        var avant = t.slice(Math.max(0, o[0] - 2), o[0]);
        if (o[0] > 0 && /[\s,]/.test(avant.slice(-1))) coupes.push(o[0]);
      });
    });
    coupes.push(texte.length);
    coupes = coupes.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
    var segs = [];
    for (var i = 0; i < coupes.length - 1; i++) {
      var a = coupes[i], b = coupes[i + 1], brut = texte.slice(a, b);
      var debut = brut.search(/\S/); if (debut < 0) continue;
      var propre = brut.replace(/[\s,.;!?]+$/, '');
      if (propre.trim().length < 3) continue;
      segs.push({ debut: a + debut, texte: propre.slice(debut) });
    }
    /* un morceau sans verbe ni intention (« et aussi, » seul) se rattache au précédent */
    return segs;
  }

  /* ---- reconnaître une demande ---- */
  function lire(seg, index) {
    var x = seg.texte, t = norm(x), marques = [];
    var ajoute = function (o, type) { marques.push([seg.debut + o[0], seg.debut + o[1], type]); };

    /* intention */
    var scores = {};
    Object.keys(L.intentions).forEach(function (k) {
      L.intentions[k].forEach(function (p) { var oc = trouver(t, p); if (oc.length) { scores[k] = (scores[k] || 0) + oc.length; oc.forEach(function (o) { ajoute(o, 'intention'); }); } });
    });
    var intention = null, best = 0;
    PRIORITE_INTENTION.forEach(function (k) { if ((scores[k] || 0) > best) { best = scores[k]; intention = k; } });

    /* forme */
    var exprime = L.formes.exprimer.some(function (p) { return trouver(t, p).length; });
    var faire = L.formes.faire.some(function (p) { return trouver(t, p).length; });
    var forme = exprime && !faire ? 'S’exprimer' : faire ? 'Faire faire' : 'Demander';

    /* verbe et objet */
    var mots = [], re = /[a-z0-9'àâäéèêëïîôöùûüçœ-]+/gi, m;
    while ((m = re.exec(t))) mots.push({ n: m[0], i: m.index, f: m.index + m[0].length });
    var verbe = null, objet = '';
    for (var k = 0; k < mots.length; k++) {
      var base = mots[k].n.replace(/-(moi|nous|lui|leur|les|le|la)$/, '');
      if (L.infinitifs[base]) {
        verbe = L.infinitifs[base]; ajoute([mots[k].i, mots[k].f], 'intention');
        var obj = [];
        for (var j = k + 1; j < mots.length && obj.length < 9; j++) {
          var w = mots[j].n;
          if (!obj.length && PRONOMS.test(w)) continue;
          if (obj.length && ARRETS_OBJET.test(w)) break;
          obj.push(mots[j]);
        }
        if (obj.length) objet = x.slice(obj[0].i, obj[obj.length - 1].f);
        break;
      }
    }

    /* pour qui */
    var pourqui = null;
    var rq = /\b(pour|a|aux|avec) (mon|ma|mes|le|la|les|l'|nos|notre|vos|votre|ses|son|sa) ?([a-z'-]+)( [a-z'-]+)?/g;
    while ((m = rq.exec(t)) && !pourqui) {
      var mot = m[3];
      if (/^\d/.test(mot) || new RegExp('^(' + MOIS + ')$').test(mot) || L.lieux.indexOf(mot) !== -1 || /^(budget|prix|fois|moment|semaine|mois|jour|soir|matin|salle)$/.test(mot)) continue;
      if (m[1] === 'avec' && !/^(mes|nos|les)$/.test(m[2])) continue;
      var fin = m.index + m[0].length - (m[4] && ARRETS_OBJET.test(m[4].trim()) ? m[4].length : 0);
      pourqui = x.slice(m.index + m[1].length + 1, fin).trim().replace(/\s+(du|de|des|d'|le|la|les|à|a|au|aux|en)$/i, ''); ajoute([m.index, m.index + m[1].length + 1 + pourqui.length], 'element');
    }

    /* quand */
    var quand = null, rangQuand = null;
    L.temps.forEach(function (e) {
      trouver(t, e[0]).forEach(function (o) {
        if (rangQuand === null || e[1] < rangQuand || (e[1] === rangQuand && JOURS_SEM[e[0]])) {
          var sx = /(avant|d'ici|pour|des|le|ce|cette|jusqu'a) $/.exec(t.slice(0, o[0]));
          var a = sx ? o[0] - sx[0].length : o[0];
          quand = x.slice(a, o[1]); rangQuand = e[1];
        }
        ajoute(o, 'element');
      });
    });
    var rd = new RegExp('(avant le |le |pour le |d\'ici le |du )?(\\d{1,2})(er)? (' + MOIS + ')( \\d{4})?', 'g');
    while ((m = rd.exec(t))) { quand = x.slice(m.index, m.index + m[0].length); rangQuand = Math.min(rangQuand === null ? 9 : rangQuand, 4); ajoute([m.index, m.index + m[0].length], 'element'); }
    var rn = /(dans|d'ici) (\d+) (jours?|semaines?|mois|heures?)/g;
    while ((m = rn.exec(t))) {
      var n = +m[2], u = m[3][0]; var r = u === 'h' ? 0 : u === 'j' ? (n <= 1 ? 1 : n <= 7 ? 2 : 3) : u === 's' ? (n <= 1 ? 2 : 3) : 4;
      quand = x.slice(m.index, m.index + m[0].length); rangQuand = r; ajoute([m.index, m.index + m[0].length], 'element');
    }

    /* où */
    var lieu = null, ro = /(^|[\s,(])((?:à|a|au|en|chez|dans|près de|pres de) )([A-ZÀ-Ý][\wÀ-ÿ'-]+(?: [A-ZÀ-Ý][\wÀ-ÿ'-]+)?)/g;
    while ((m = ro.exec(x)) && !lieu) {
      if (new RegExp('^(' + MOIS + ')$').test(norm(m[3])) || m.index + m[1].length === 0) continue;
      var dl = m.index + m[1].length; lieu = m[2] + m[3]; ajoute([dl, dl + lieu.length], 'element');
    }
    if (!lieu) L.lieux.forEach(function (p) { if (!lieu) { var o = trouver(t, p)[0]; if (o) { var sx = /(a la|dans la|dans le|au|a l'|dans l') $/.exec(t.slice(0, o[0])); if (sx) { var a = o[0] - sx[0].length; lieu = x.slice(a, o[1]); ajoute([a, o[1]], 'element'); } } } });

    /* combien */
    var quantites = [], rc = new RegExp('(\\d[\\d  .,]*)\\s?(' + L.unites.map(function (u) { return u.replace('€', '\\u20ac'); }).join('|') + ')(?![a-z])', 'g');
    while ((m = rc.exec(t))) { quantites.push(x.slice(m.index, m.index + m[0].length).trim()); ajoute([m.index, m.index + m[0].length], 'element'); }

    /* conditions */
    var conditions = [], rcd = /\b(sans|pas plus de|pas plus d'|maximum|max|moins de|au plus|au maximum|budget|uniquement|seulement)\b[^,.;!?]*/g;
    while ((m = rcd.exec(t))) {
      var ms = x.slice(m.index, m.index + m[0].length).split(/\s+/), garde = [ms[0]];
      for (var q = 1; q < ms.length && garde.length < 7; q++) { if (/^(pour|à|a|avant|après|apres|le|la|sur|et|mais|car|qui|que)$/i.test(ms[q]) && garde.length > 1) break; garde.push(ms[q]); }
      var morceau = garde.join(' '); conditions.push(morceau); ajoute([m.index, m.index + morceau.length], 'element');
    }
    var radj = /\b(vegetarien(ne)?s?|vegan(e)?s?|bio|gratuit(e)?s?|accessibles?|sans gluten)\b/g;
    while ((m = radj.exec(t))) { var adj = x.slice(m.index, m.index + m[0].length); if (!conditions.some(function (c) { return c.indexOf(adj) !== -1; })) conditions.push(adj); ajoute([m.index, m.index + m[0].length], 'element'); }

    /* forme du résultat et ton */
    var format = null; L.formats.forEach(function (p) { if (!format) { var o = trouver(t, p)[0]; if (o) { format = x.slice(o[0], o[1]); ajoute(o, 'element'); } } });
    var ton = null, rt = /\b(tendre|drole|solennel|formel|chaleureux|sobre|poetique|emouvant|court|simple|detaille)\b/; if ((m = rt.exec(t))) { ton = x.slice(m.index, m.index + m[0].length); ajoute([m.index, m.index + m[0].length], 'element'); }

    /* l’ordre que la personne a dit */
    var rangOrdre = null;
    L.ordre.forEach(function (e) { trouver(t, e[0]).forEach(function (o) { if (o[0] < 25 && (rangOrdre === null || e[1] < rangOrdre)) rangOrdre = e[1]; ajoute(o, 'ordre'); }); });

    /* ce qui manque */
    var present = { pourqui: !!pourqui, quand: !!quand, lieu: !!lieu, format: !!format, ton: !!ton, contexte: x.length > 90, conditions: conditions.length > 0 };
    var manque = ((intention && L.manques[intention]) || ['contexte']).filter(function (k) { return !present[k]; }).map(function (k) { return L.questions[k]; });

    /* la demande reconstruite */
    var tete = verbe ? verbe[0].toUpperCase() + verbe.slice(1) + (objet ? ' ' + objet : '') : (VERBE_PAR_DEFAUT[intention] || 'Demander') + ' : ' + x.replace(/^(et aussi|ensuite|puis|d'abord|enfin|et apres|pour finir)[ ,]*/i, '');
    var phrase = tete;
    if (pourqui && phrase.indexOf(pourqui) === -1) phrase += ' pour ' + pourqui.replace(/^(pour|a|aux|avec) /i, '');
    if (lieu && phrase.indexOf(lieu) === -1) phrase += ' ' + lieu;
    if (quand && phrase.indexOf(quand) === -1) phrase += ', ' + quand;
    quantites.forEach(function (q) { if (phrase.indexOf(q) === -1 && !conditions.some(function (c) { return c.indexOf(q) !== -1; })) phrase += ', ' + q; });
    conditions.forEach(function (c) { if (phrase.indexOf(c) === -1) phrase += ', ' + c; });
    if (ton && phrase.indexOf(ton) === -1) phrase += ', sur un ton ' + ton;
    phrase = phrase.replace(/\s+/g, ' ').trim() + '.';

    return { index: index, texte: x, intention: intention, forme: forme, verbe: verbe, objet: objet, pourqui: pourqui, quand: quand, rangQuand: rangQuand,
      lieu: lieu, quantites: quantites, conditions: conditions, format: format, ton: ton, rangOrdre: rangOrdre, manque: manque, phrase: phrase, marques: marques };
  }

  /* ---- analyser : découper, lire, ranger ---- */
  function analyser(texte) {
    var demandes = decouper(texte || '').map(lire).filter(function (d) { return d.intention || d.verbe || d.texte.length > 12; });
    var tri = demandes.slice().sort(function (a, b) {
      var oa = a.rangOrdre === null ? 5 : a.rangOrdre, ob = b.rangOrdre === null ? 5 : b.rangOrdre;
      if (oa !== ob) return oa - ob;
      var qa = a.rangQuand === null ? 5 : a.rangQuand, qb = b.rangQuand === null ? 5 : b.rangQuand;
      if (qa !== qb) return qa - qb;
      return a.index - b.index;
    });
    return { demandes: tri, marques: demandes.reduce(function (acc, d) { return acc.concat(d.marques); }, []) };
  }

  window.ATLAS.moteur = { analyser: analyser, norm: norm };
  if (typeof document === 'undefined' || !document.getElementById('moteur')) return;

  /* =================== l’affichage =================== */
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fr = function (s) { return esc(s).replace(/ ([:;?!])/g, ' $1'); };
  var num = function (v) { return String(v).replace('.', ','); };
  var parId = {}; S.demandes.forEach(function (d) { parId[d.id] = d; });
  var champ = document.getElementById('demande'), sortie = document.getElementById('resultat'), surligne = document.getElementById('surligne'), resume = document.getElementById('resume');
  var inverse = false;

  function surligner(texte, marques) {
    var type = new Array(texte.length).fill('');
    marques.forEach(function (m) { for (var i = m[0]; i < m[1] && i < texte.length; i++) if (type[i] !== 'intention') type[i] = m[2] === 'ordre' ? 'intention' : m[2]; });
    var o = '', cur = '', buf = '';
    var vide = function () { if (!buf) return; o += cur ? '<mark class="info-remplie' + (cur === 'intention' ? ' vient' : '') + '">' + esc(buf) + '</mark>' : esc(buf); buf = ''; };
    for (var i = 0; i < texte.length; i++) { if (type[i] !== cur) { vide(); cur = type[i]; } buf += texte[i]; }
    vide(); return o;
  }
  function ligne(dt, dd) { return '<dt>' + dt + '</dt><dd' + (dd ? '' : ' class="non-dit"') + '>' + (dd ? fr(dd) : 'non dit') + '</dd>'; }
  function carte(d, k) {
    var stat = d.intention ? parId[d.intention] : null;
    var part = stat ? (stat.min === stat.max ? num(stat.min) + ' %' : num(stat.min) + ' à ' + num(stat.max) + ' %') : '';
    var src = stat ? S.sources[stat.source] : null;
    var manque = d.manque.length ? '<div class="manque"><p class="etiquette-manque">Ce qui manque</p><ul class="puces">' + d.manque.map(function (q) { return '<li>' + fr(q) + '</li>'; }).join('') + '</ul></div>' : '<div class="manque"><p class="etiquette-manque">Rien ne manque</p></div>';
    var grille = '<dl class="fiche-faits grille-demande">' +
      ligne('Quoi', d.verbe ? d.verbe + (d.objet ? ' ' + d.objet : '') : '') + ligne('Pour qui, pour quoi', d.pourqui) + ligne('Quand', d.quand) + ligne('Où', d.lieu) +
      ligne('Combien', d.quantites.join(', ')) + ligne('Conditions', d.conditions.join(', ') + (d.ton ? (d.conditions.length ? ', ' : '') + 'ton ' + d.ton : '')) + ligne('Sous quelle forme', d.format) + '</dl>';
    return '<li class="moment demande"><div class="moment-tete"><span class="moment-num">' + String(k + 1).padStart(2, '0') + '</span><div>' +
      '<div class="demande-etats"><span class="etat ' + (d.forme === 'Faire faire' ? 'prod' : d.forme === 'S’exprimer' ? 'archi' : '') + '">' + esc(d.forme) + '</span>' + (stat ? '<span class="etat">' + esc(stat.nom) + '</span>' : '<span class="etat dev">Intention à préciser</span>') + '</div>' +
      '<h3>' + fr(d.phrase) + '</h3>' +
      (inverse ? manque + grille : grille + manque) +
      (stat ? '<p class="fonde">Fondé : ' + part + ' des ' + (stat.source === 'anthropic' ? 'conversations Claude' : 'messages ChatGPT') + ' relèvent de la même intention (' + esc(src.nom.split(',')[0]) + ', ' + esc(src.quand.split(',')[0]) + ').</p>' : '') +
      '<p class="moment-source">Vos mots&nbsp;: « ' + esc(d.texte) + ' »</p></div></div></li>';
  }
  function rendre() {
    var texte = champ.value, a = analyser(texte), liste = inverse ? a.demandes.slice().reverse() : a.demandes;
    surligne.innerHTML = texte.trim() ? surligner(texte, a.marques) : '<span class="non-dit">Votre demande apparaîtra ici, avec les mots reconnus surlignés.</span>';
    resume.textContent = a.demandes.length ? a.demandes.length + ' demande' + (a.demandes.length > 1 ? 's' : '') + ' reconnue' + (a.demandes.length > 1 ? 's' : '') + ', rangée' + (a.demandes.length > 1 ? 's' : '') + (inverse ? ' du moins important au plus important.' : ' du plus important au moins important.') : '';
    sortie.innerHTML = liste.map(carte).join('');
  }
  var minuterie = 0;
  champ.addEventListener('input', function () { clearTimeout(minuterie); minuterie = setTimeout(rendre, 180); });
  document.getElementById('reconstruire').addEventListener('click', rendre);
  document.getElementById('sens').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; inverse = b.getAttribute('data-sens') === 'inverse';
    Array.prototype.forEach.call(this.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); }); rendre();
  });
  document.getElementById('exemples').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; champ.value = b.getAttribute('data-texte'); rendre(); champ.focus(); });

  /* =================== les statistiques =================== */
  var max = 30;
  document.getElementById('barres').innerHTML = S.demandes.map(function (d) {
    var src = S.sources[d.source];
    return '<li class="barre-ligne"><div class="barre-nom"><b>' + fr(d.nom) + '</b><span>' + fr(d.exemple) + '</span></div>' +
      '<div class="barre-piste" role="img" aria-label="' + esc(d.nom) + ' : ' + (d.min === d.max ? num(d.min) : num(d.min) + ' à ' + num(d.max)) + ' %">' +
      '<span class="barre-min" style="width:' + (d.min / max * 100).toFixed(2) + '%"></span>' +
      (d.max > d.min ? '<span class="barre-ecart" style="left:' + (d.min / max * 100).toFixed(2) + '%;width:' + ((d.max - d.min) / max * 100).toFixed(2) + '%"></span>' : '') + '</div>' +
      '<div class="barre-val">' + (d.min === d.max ? num(d.min) : num(d.min) + '–' + num(d.max)) + ' %<small>' + esc(src.nom.split(',')[0]) + '</small></div>' +
      (d.note ? '<p class="barre-note">' + fr(d.note) + '</p>' : '') + '</li>';
  }).join('');
  document.getElementById('formes').innerHTML = S.formes.map(function (f) { return '<div class="forme-part" style="flex:' + f.part + '"><b>' + f.part + ' %</b><span>' + fr(f.nom) + '</span><small>' + fr(f.texte) + '</small></div>'; }).join('');
  var tuile = function (r) { return '<li><b>' + esc(r.chiffre) + '</b><p>' + fr(r.texte) + '</p><small>' + esc(S.sources[r.source].nom.split(',')[0]) + '</small></li>'; };
  document.getElementById('reperes').innerHTML = S.reperes.map(tuile).join('');
  document.getElementById('envies').innerHTML = S.envies.map(tuile).join('');
  document.getElementById('inverse').innerHTML = S.inverse.map(function (r) {
    return '<li><div><span>N° ' + r.rang + ' de ce que les gens racontent</span><b>' + fr(r.nom) + '</b><p>Mesuré&nbsp;: ' + fr(r.mesure) + '.</p></div></li>';
  }).join('');
  document.getElementById('sources').innerHTML = Object.keys(S.sources).map(function (k) { var s = S.sources[k]; return '<li><a href="' + esc(s.lien) + '" target="_blank" rel="noopener">' + fr(s.nom) + '</a><span>' + fr(s.quand + ' · ' + s.base) + '</span></li>'; }).join('');

  champ.value = document.querySelector('#exemples button').getAttribute('data-texte');
  rendre();

  /* le dock du bas : un lieu par section, un arc par lieu */
  var ids = ['moteur', 'demandes', 'envies', 'ordre-inverse', 'sources'];
  var lieux = Array.prototype.slice.call(document.querySelectorAll('#dock .lieu')), arcs = document.getElementById('arcs'), progres = document.getElementById('progres'), dock = document.getElementById('dock');
  function arc(i, n) { var gap = 14, span = 360 / n, a0 = -90 + i * span + gap / 2, a1 = a0 + span - gap, r = 18; var pt = function (a) { var t = a * Math.PI / 180; return (22 + r * Math.cos(t)).toFixed(2) + ' ' + (22 + r * Math.sin(t)).toFixed(2); }; return 'M ' + pt(a0) + ' A ' + r + ' ' + r + ' 0 0 1 ' + pt(a1); }
  var raf = 0;
  function maj() {
    var c = -1, l = window.innerHeight * 0.4;
    ids.forEach(function (id, k) { var el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= l) c = k; });
    var d = document.documentElement, lu = Math.min(1, Math.max(0, window.scrollY / Math.max(1, d.scrollHeight - window.innerHeight)));
    lieux.forEach(function (a, k) { a.setAttribute('aria-current', k === c ? 'true' : 'false'); });
    arcs.innerHTML = ids.map(function (_, k) { var on = k === c; return '<path d="' + arc(k, ids.length) + '" fill="none" stroke="#fff" stroke-width="' + (on ? 4 : 2) + '" stroke-opacity="' + (on ? 1 : 0.32) + '" stroke-linecap="round"/>'; }).join('');
    progres.setAttribute('stroke-dasharray', (69.1 * lu).toFixed(1) + ' 69.1');
    if (c >= 0) { var cur = lieux[c]; if (cur.offsetLeft < dock.scrollLeft || cur.offsetLeft + cur.offsetWidth > dock.scrollLeft + dock.clientWidth) dock.scrollLeft = cur.offsetLeft - 60; }
  }
  window.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(maj); }, { passive: true });
  window.addEventListener('resize', maj); maj();
})();
