/* L'Atlas : affiche window.ATLAS (data/histoire.js, data/projets.js) avec les classes du design system AIME. */
(function () {
  var A = window.ATLAS, H = A.histoire, PROJETS = A.projets;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  /* typographie française : espace insécable avant « : » et « ; » */
  var fr = function (s) { return esc(s).replace(/ ([:;])/g, ' $1'); };
  /* le bandeau : un grand visuel sur toute la largeur, le titre du chapitre en blanc dessus (data/visuels.js) */
  var VIS = {}; (A.visuels || []).forEach(function (v) { VIS[v.id] = v; });
  function tete(ch, h) {
    var v = VIS[ch.bandeau], titre = '<p class="date-chapitre">' + esc(ch.date) + '</p><' + h + ' id="t-' + esc(ch.id) + '" class="grand-mot">' + fr(ch.titre) + '</' + h + '>';
    if (!v) return titre;
    return '<div class="bandeau"><img src="' + esc(v.src) + '" alt="' + esc(v.alt) + '" loading="lazy"' + (v.pos ? ' style="object-position:' + esc(v.pos) + '"' : '') + '><div class="bandeau-texte">' + titre + '</div></div>';
  }
  var puces = function (l) { return l && l.length ? '<ul class="puces">' + l.map(function (p) { return '<li>' + fr(p) + '</li>'; }).join('') + '</ul>' : ''; };

  document.getElementById('chiffres').innerHTML = H.chiffres.map(function (c) { return '<li><b>' + esc(c[0]) + '</b><span>' + fr(c[1]) + '</span></li>'; }).join('');

  /* les chapitres : des moments, des visuels, et l'écosystème en fiches */
  document.getElementById('chapitres').innerHTML = H.chapitres.map(function (ch, k) {
    var moments = ch.moments ? '<ol class="journee">' + ch.moments.map(function (m, j) {
      return '<li class="moment" id="' + esc(ch.id) + '-' + j + '"><div class="moment-tete"><span class="moment-num">' + esc(m.quand) + '</span><div>' +
        '<h3>' + fr(m.titre) + '</h3><p>' + fr(m.texte) + '</p>' + puces(m.puces) +
        (m.source ? '<p class="moment-source">Source&nbsp;: <code>' + esc(m.source) + '</code></p>' : '') + '</div></div></li>';
    }).join('') + '</ol>' : '';
    var visuels = ch.visuels ? '<div class="duo">' + ch.visuels.map(function (v) {
      return '<figure class="visuel"><img src="' + esc(v.src) + '" alt="' + esc(v.alt) + '" loading="lazy"><figcaption><span><span class="accroche">' + fr(v.accroche) + '</span><span class="legende">' + fr(v.legende) + '</span></span></figcaption></figure>';
    }).join('') + '</div>' : '';
    var eco = ch.projets ? '<div class="filtres" role="group" aria-label="Filtrer par état" id="filtres"></div><ul class="fiches" id="fiches" aria-live="polite"></ul>' +
      '<p class="note-source">États et descriptions tels que déclarés dans <code>Aime-wedding/src/data/ecosystemProjects.js</code>. Tous les projets y sont datés de 2026, sans mois.</p>' : '';
    return '<section id="' + esc(ch.id) + '" class="chapitre' + (k === 0 ? ' premier' : '') + (VIS[ch.bandeau] ? ' a-bandeau' : '') + '" aria-labelledby="t-' + esc(ch.id) + '">' + tete(ch, 'h2') +
      '<p class="chapeau">' + fr(ch.chapeau) + '</p>' + moments + eco + visuels + '</section>';
  }).join('');

  /* demain, sur la bande noire */
  var D = H.demain;
  if (VIS[D.bandeau]) document.getElementById('demain').classList.add('a-bandeau');
  document.getElementById('demain').innerHTML = tete(D, 'h2') + '<p class="chapeau">' + fr(D.chapeau) + '</p>' +
    '<ol class="etapes">' + D.etapes.map(function (e) { return '<li><div><b>' + fr(e[0]) + '</b><span>' + fr(e[1]) + '</span></div></li>'; }).join('') + '</ol>' +
    '<p class="surtitre" style="margin-top:72px;color:rgba(255,255,255,.65)">À l’horizon</p><ul class="nouveau">' +
    D.horizon.map(function (h) { return '<li><span>' + fr(h[0]) + '</span><b>' + fr(h[1]) + '</b><p>' + fr(h[2]) + '</p></li>'; }).join('') + '</ul>' + achevement();

  /* l’achèvement : les briques de ce qui a été refait le plus souvent, composées (data/achevement.js) */
  function achevement() {
    var ACH = A.achevement; if (!ACH || !A.bloc) return '';
    return '<p class="surtitre" id="achevement" style="margin-top:96px;color:rgba(255,255,255,.65)">L’achèvement</p><h3 class="titre" style="color:#fff">Ce qui peut être construit</h3>' +
      '<p class="chapeau">' + fr(ACH.principe) + '</p><div class="apercu-achevement" role="list">' +
      ACH.briques.map(function (b) { return '<article role="listitem" class="bloc brique ' + b.style + '" style="grid-column:' + (b.x + 1) + ' / span ' + b.w + ';grid-row:' + (b.y + 1) + ' / span ' + b.h + '">' + A.bloc.brique(b, 'apercu') + '</article>'; }).join('') +
      '</div><p class="lien-metamorphose"><a class="bouton" href="metamorphose.html">Ouvrir la Métamorphose : déplacer les briques, glisser les 643 projets</a></p>';
  }

  /* l'écosystème : filtre par état avec les boutons d'option (.opt) */
  var CLASSE = { 'En production': 'prod', 'En développement': 'dev', 'Prototype': 'proto', 'Architecture': 'archi' };
  var ORDRE = ['En production', 'En développement', 'Prototype', 'Architecture'];
  var filtre = 'Tous', zoneF = document.getElementById('filtres'), zoneL = document.getElementById('fiches');
  function filtres() {
    var choix = ['Tous'].concat(ORDRE.filter(function (s) { return PROJETS.some(function (p) { return p.etat === s; }); }));
    zoneF.innerHTML = choix.map(function (s) {
      var n = s === 'Tous' ? PROJETS.length : PROJETS.filter(function (p) { return p.etat === s; }).length;
      return '<button type="button" class="opt" aria-pressed="' + (s === filtre) + '" data-s="' + esc(s) + '">' + esc(s) + ' <small>' + n + '</small></button>';
    }).join('');
  }
  function fiches() {
    zoneL.innerHTML = PROJETS.filter(function (p) { return filtre === 'Tous' || p.etat === filtre; }).map(function (p) {
      var lien = /^https:\/\//.test(p.lien) ? '<a class="ouvrir" href="' + esc(p.lien) + '" target="_blank" rel="noopener">' + esc(p.lien.replace(/^https:\/\//, '').replace(/\/$/, '')) + '</a>' : '';
      return '<li class="fiche"><div class="fiche-haut"><span class="cat">' + esc(p.categorie) + '</span><span class="etat ' + (CLASSE[p.etat] || '') + '">' + esc(p.etat) + '</span></div>' +
        '<h3>' + fr(p.titre) + '</h3><p>' + fr(p.description) + '</p>' + puces((p.fonctions || []).slice(0, 5)) + lien + '</li>';
    }).join('');
  }
  zoneF.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; filtre = b.getAttribute('data-s'); filtres(); fiches(); });
  filtres(); fiches();

  /* le dock du bas : un lieu par chapitre, un arc par lieu, l'anneau suit la lecture (comme DockBas sur lemondeaime.com) */
  var dock = document.getElementById('dock');
  var tous = H.chapitres.concat([D]);
  dock.insertAdjacentHTML('beforeend', tous.map(function (c) { return '<a class="lieu" href="#' + esc(c.id) + '" aria-current="false">' + esc(c.lieu) + '</a>'; }).join(''));
  var lieux = Array.prototype.slice.call(dock.querySelectorAll('.lieu'));
  var arcs = document.getElementById('arcs'), progres = document.getElementById('progres');
  function arc(i, n) {
    var gap = 14, span = 360 / n, a0 = -90 + i * span + gap / 2, a1 = a0 + span - gap, r = 18;
    var pt = function (a) { var t = a * Math.PI / 180; return (22 + r * Math.cos(t)).toFixed(2) + ' ' + (22 + r * Math.sin(t)).toFixed(2); };
    return 'M ' + pt(a0) + ' A ' + r + ' ' + r + ' 0 0 1 ' + pt(a1);
  }
  var raf = 0;
  function maj() {
    var c = -1, ligne = window.innerHeight * 0.4;
    tous.forEach(function (ch, k) { var el = document.getElementById(ch.id); if (el && el.getBoundingClientRect().top <= ligne) c = k; });
    var d = document.documentElement, max = Math.max(1, d.scrollHeight - window.innerHeight), lu = Math.min(1, Math.max(0, window.scrollY / max));
    lieux.forEach(function (a, k) { a.setAttribute('aria-current', k === c ? 'true' : 'false'); });
    arcs.innerHTML = tous.map(function (_, k) { var on = k === c; return '<path d="' + arc(k, tous.length) + '" fill="none" stroke="#fff" stroke-width="' + (on ? 4 : 2) + '" stroke-opacity="' + (on ? 1 : 0.32) + '" stroke-linecap="round"/>'; }).join('');
    progres.setAttribute('stroke-dasharray', (69.1 * lu).toFixed(1) + ' 69.1');
    if (c >= 0) { var cur = lieux[c]; if (cur.offsetLeft < dock.scrollLeft || cur.offsetLeft + cur.offsetWidth > dock.scrollLeft + dock.clientWidth) dock.scrollLeft = cur.offsetLeft - 60; }
  }
  /* le Disque : les époques en couronne ; choisir une époque, et le Disque devient son sommaire */
  if (A.disque) {
    var aller = function (id) { var el = document.getElementById(id); if (el) { el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); } };
    var lu = function () { var c = -1; tous.forEach(function (ch, k) { var el = document.getElementById(ch.id); if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) c = k; }); return c; };
    var disque = A.disque({ racine: function () {
      var c = lu();
      return { titre: 'L’atlas', sous: 'Un Point. Toute l’histoire.', note: tous.length + ' époques · ' + A.applications.length + ' applications. Choisissez une époque : le Disque devient son sommaire.',
        items: tous.map(function (ch, k) { return { mot: ch.lieu, actif: k === c, niveau: function () { return epoque(ch); } }; }) };
    } });
    var epoque = function (ch) {
      var ms = (ch.moments || []).slice(0, 10);
      var items = [{ mot: 'Tout le chapitre', sous: ch.date, agir: function () { aller(ch.id); } }].concat(ms.map(function (m, j) { return { mot: m.quand, sous: m.titre, agir: function () { aller(ch.id + '-' + j); } }; }));
      if (ch.projets) items.push({ mot: 'Les fiches', sous: PROJETS.length + ' projets', agir: function () { aller('fiches'); } });
      if (ch.id === 'demain') items.push({ mot: 'L’achèvement', sous: 'Les douze briques', agir: function () { aller('achevement'); } }, { mot: 'Métamorphose', sous: 'Ouvrir la grille', agir: function () { location.href = 'metamorphose.html'; } });
      return { titre: ch.titre, sous: ch.date, note: (ms.length ? ms.length + ' moment' + (ms.length > 1 ? 's' : '') + '. ' : '') + 'Choisissez où aller : le Disque vous y mène.', items: items };
    };
    Array.prototype.forEach.call(document.querySelectorAll('[data-disque]'), function (b) { b.addEventListener('click', function () { disque.ouvrir(); }); });
  }

  window.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(maj); }, { passive: true });
  window.addEventListener('resize', maj);
  maj();
})();
