/* La Métamorphose : glisser les 643 projets et les visuels de l’arbre vers une grille magnétique de 12 colonnes,
   où chacun reprend la forme de la Charte ; toucher un bloc le choisit (ses actions, ses quatre coins pour l’agrandir, sa fiche) ;
   changer de mise en page d’un clic ; poser des modules, les relier, les fusionner.
   Les positions sont en unités de 12 colonnes. La composition est gardée sur cet appareil (localStorage), rien n’est envoyé. */
(function () {
  var A = window.ATLAS, B = A.bloc, ACH = A.achevement, H = A.histoire;
  var CLE = 'atlas-metamorphose-v1';
  var grille = document.getElementById('grille'), aimant = document.getElementById('aimant'), compte = document.getElementById('compte');
  var barre = document.getElementById('barre-bloc'), fiche = document.getElementById('fiche');

  /* ---------- les projets : un groupe par nom (les copies et versions ensemble), dans sa famille ---------- */
  var base = function (n) { return n.replace(/\s*\(copy\)/gi, '').replace(/\s+copy$/i, '').trim(); };
  var groupes = {}, ordreGroupes = [];
  A.applications.forEach(function (a) {
    var id = a[2] + '|' + base(a[1]);
    if (!groupes[id]) { groupes[id] = { id: id, famille: a[2], nom: base(a[1]), n: 0, premier: a[0], dernier: a[0], dates: [], noms: {} }; ordreGroupes.push(id); }
    var g = groupes[id]; g.n++; g.dates.push(a[0]); g.noms[a[1]] = 1;
    if (a[0] < g.premier) g.premier = a[0]; if (a[0] > g.dernier) g.dernier = a[0];
  });
  var parFamille = {}; A.familles.forEach(function (f) { parFamille[f.id] = { apps: 0, groupes: [] }; });
  A.applications.forEach(function (a) { parFamille[a[2]].apps++; });
  ordreGroupes.forEach(function (id) { parFamille[groupes[id].famille].groupes.push(groupes[id]); });
  var briques = {}; ACH.briques.forEach(function (b) { briques[b.id] = b; });
  var visuels = {}; A.visuels.forEach(function (v) { visuels[v.id] = v; });
  var modules = A.module.def;
  var visuelDe = function (f) { return A.visuels.filter(function (v) { return v.famille === f; })[0] || A.visuels[0]; };

  /* ---------- l’étude d’un fragment : ce que disent ses dates, sa famille, sa brique ---------- */
  var CHAP = { '2025-11': 'novembre', '2025-12': 'decembre', '2026-01': 'hiver', '2026-02': 'hiver', '2026-03': 'hiver', '2026-04': 'avril', '2026-05': 'mai', '2026-06': 'juin', '2026-07': 'juillet', '2026-08': 'aout', '2026-09': 'aout', '2026-10': 'octobre' };
  var chapitre = function (d) { var id = CHAP[d.slice(0, 7)]; return (H && H.chapitres.filter(function (c) { return c.id === id; })[0]) || null; };
  var jours = function (a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 864e5); };
  var A_PART = { etudes: 'une étude d’un site existant', sanstitre: 'un essai resté sans titre', jeux: 'un jeu', explorations: 'une exploration' };
  function etude(g) {
    var br = briques[g.famille], ch = chapitre(g.premier);
    var duree = jours(g.premier, g.dernier);
    return {
      brique: br, chapitre: ch, total: parFamille[g.famille].groupes.length, duree: duree,
      phrase: g.n > 1 ? 'Recommencé ' + g.n + ' fois' + (duree > 0 ? ' en ' + duree + ' jour' + (duree > 1 ? 's' : '') : ' le même jour') + ' : un besoin qui revient.' : 'Tenté une fois : une idée posée, pas encore reprise.',
      sens: br ? 'Posé ici, il nourrit « ' + br.titre + ' » : ' + br.role.charAt(0).toLowerCase() + br.role.slice(1) : 'Hors achèvement : ' + (A_PART[g.famille] || 'à classer') + '. Il éclaire les briques sans en être une.'
    };
  }
  /* ses voisins sur la grille : les blocs de la même famille posés à côté */
  var colle = function (a, b) { return a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h; };
  var familleDe = function (b) { return b.type === 'brique' ? briques[b.ref].famille : b.type === 'groupe' ? groupes[b.ref].famille : b.type === 'module' ? modules[b.ref].famille : b.type === 'fusion' ? familleDe(b.parts[0]) : visuels[b.ref].famille; };
  var nomDe = function (b) { return b.type === 'brique' ? briques[b.ref].titre : b.type === 'groupe' ? groupes[b.ref].nom : b.type === 'module' ? modules[b.ref].titre : b.type === 'fusion' ? b.parts.map(nomDe).join(' + ') : visuels[b.ref].legende; };
  function voisins(b) { return etat.blocs.filter(function (o) { return o !== b && familleDe(o) === familleDe(b) && colle(o, b); }); }

  /* ---------- la réparation : une barre par famille ---------- */
  document.getElementById('principe-texte').textContent = ACH.principe;
  var A_PART_ID = { etudes: 1, sanstitre: 1, jeux: 1, explorations: 1 };
  var rangs = A.familles.slice().sort(function (a, b) { return (A_PART_ID[a.id] ? 1 : 0) - (A_PART_ID[b.id] ? 1 : 0) || parFamille[b.id].apps - parFamille[a.id].apps; });
  var max = Math.max.apply(null, A.familles.map(function (f) { return parFamille[f.id].apps; }));
  document.getElementById('barres').innerHTML = rangs.map(function (f) {
    var n = parFamille[f.id].apps;
    return '<li class="' + (A_PART_ID[f.id] ? 'a-part' : '') + '"><b>' + B.pastille(f.id) + ' ' + B.fr(f.nom) + '</b><span class="piste" role="img" aria-label="' + B.esc(f.nom) + ' : ' + n + ' applications"><span class="plein" style="width:' + (n / max * 100).toFixed(1) + '%"></span></span><span class="n">' + n + '</span></li>';
  }).join('');

  /* ---------- l’arbre : les visuels, puis les familles en dossiers, les projets en fragments ---------- */
  var zoneFamilles = document.getElementById('familles'), filtre = document.getElementById('filtre');
  var ouverts = {};   /* les dossiers ouverts restent ouverts quand la grille change */
  zoneFamilles.addEventListener('toggle', function (ev) { var d = ev.target; if (d.dataset && d.dataset.f) ouverts[d.dataset.f] = d.open; }, true);
  var sans = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  function arbre() {
    var q = sans(filtre.value.trim()), poses = {};
    etat.blocs.forEach(function (b) { poses[b.type + ':' + b.ref] = 1; });
    var vs = A.visuels.filter(function (v) { return !q || sans(v.accroche + ' ' + v.legende + ' ' + v.alt).indexOf(q) !== -1 || 'visuels'.indexOf(q) === 0; });
    var dossierVisuels = vs.length ? '<details class="famille visuels" data-f="visuels"' + (q || ouverts.visuels ? ' open' : '') + '><summary><i class="pastille-famille" style="background:var(--nacre)"></i>Les visuels<small>' + A.visuels.length + '</small></summary><ul class="fragments vignettes">' +
      vs.map(function (v) { return '<li><button type="button" class="fragment vignette' + (poses['visuel:' + v.id] ? ' place' : '') + '" data-v="' + v.id + '" aria-label="Poser le visuel « ' + B.esc(v.legende) + ' » sur la grille"><img src="' + B.esc(v.src) + '" alt="" loading="lazy"><span>' + B.fr(v.legende) + '</span></button></li>'; }).join('') + '</ul></details>' : '';
    var ms = A.modules.filter(function (m) { return !q || sans(m.titre + ' ' + m.role).indexOf(q) !== -1 || 'modules'.indexOf(q) === 0; });
    var dossierModules = ms.length ? '<details class="famille modules" data-f="modules"' + (q || ouverts.modules !== false ? ' open' : '') + '><summary><i class="pastille-famille arc"></i>Les modules<small>' + A.modules.length + '</small></summary><ul class="fragments">' +
      ms.map(function (m) { return '<li><button type="button" class="fragment module-frag' + (poses['module:' + m.id] ? ' place' : '') + '" data-m="' + m.id + '" aria-label="Poser le module ' + B.esc(m.titre) + ' sur la grille"><span>' + B.fr(m.titre) + '</span><small>' + B.fr(m.role.split(' :')[0].split(',')[0]) + '</small></button></li>'; }).join('') + '</ul></details>' : '';
    zoneFamilles.innerHTML = dossierModules + dossierVisuels + A.familles.map(function (f) {
      var gs = parFamille[f.id].groupes.filter(function (g) { return !q || sans(g.nom).indexOf(q) !== -1 || sans(f.nom).indexOf(q) !== -1; });
      if (!gs.length) return '';
      return '<details class="famille" data-f="' + f.id + '"' + (q || ouverts[f.id] ? ' open' : '') + '><summary>' + B.pastille(f.id) + B.fr(f.nom) + '<small>' + parFamille[f.id].apps + '</small></summary><ul class="fragments">' +
        gs.map(function (g) { return '<li><button type="button" class="fragment' + (poses['groupe:' + g.id] ? ' place' : '') + '" data-g="' + B.esc(g.id) + '" aria-label="Poser ' + B.esc(g.nom) + ' sur la grille"><span>' + B.fr(g.nom) + '</span><small>' + (g.n > 1 ? '×' + g.n : '') + '</small></button></li>'; }).join('') + '</ul></details>';
    }).join('') || '<p class="aide">Aucun projet ne contient « ' + B.esc(filtre.value) + ' ».</p>';
  }
  filtre.addEventListener('input', arbre);

  /* ---------- l’état : les blocs posés ---------- */
  var etat = { blocs: [], inverse: false, mise: 'achevement', liens: [], donnees: { moments: [], invites: [], documents: [] } }, choisi = null, relier = null, reglage = false;
  var uid = 0;
  var existe = function (b) { return b.type === 'brique' ? briques[b.ref] : b.type === 'groupe' ? groupes[b.ref] : b.type === 'module' ? modules[b.ref] : b.type === 'fusion' ? b.parts && b.parts.length && b.parts.every(existe) : visuels[b.ref]; };
  function tailleDefaut(type, ref) { if (type === 'module') return { w: modules[ref].w, h: modules[ref].h }; if (type === 'brique') { var b = briques[ref]; return { w: b.w, h: b.h }; } return type === 'visuel' ? { w: 6, h: 3 } : { w: 3, h: 2 }; }
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* stockage indisponible : la grille reste pour la séance */ } }
  function charger() {
    try { var s = JSON.parse(localStorage.getItem(CLE) || 'null'); if (s && Array.isArray(s.blocs)) { etat = s; etat.blocs = etat.blocs.filter(existe); etat.liens = (etat.liens || []).filter(function (l) { return partie(l[0]) && partie(l[1]); }); etat.donnees = etat.donnees || { moments: [], invites: [], documents: [] }; return true; } } catch (e) { /* rien */ }
    return false;
  }
  var chevauche = function (a, b) { return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; };
  function libre(r, sauf) { return etat.blocs.every(function (b) { return b === sauf || !chevauche(r, b); }); }
  /* poser au plus près de (x, y) : la case visée si elle est libre, sinon la première libre en dessous */
  function placer(x, y, w, h, sauf) {
    x = Math.max(0, Math.min(12 - w, x)); y = Math.max(0, y);
    for (var yy = y; yy < y + 200; yy++) {
      var essais = [x]; for (var d = 1; d < 12; d++) { essais.push(x - d, x + d); }
      for (var i = 0; i < essais.length; i++) { var xx = essais[i]; if (xx < 0 || xx > 12 - w) continue; if (libre({ x: xx, y: yy, w: w, h: h }, sauf)) return { x: xx, y: yy }; }
    }
    return { x: 0, y: hauteur() };
  }
  var hauteur = function () { return etat.blocs.reduce(function (m, b) { return Math.max(m, b.y + b.h); }, 0); };
  function ajouter(type, ref, x, y, taille) {
    var t = taille || tailleDefaut(type, ref), p = x === undefined ? placer(0, 0, t.w, t.h) : placer(x, y, t.w, t.h);
    var b = { uid: 'b' + (++uid) + Date.now().toString(36), type: type, ref: ref, x: p.x, y: p.y, w: t.w, h: t.h };
    etat.blocs.push(b); choisi = b.uid; rendre(); sauver(); return b;
  }

  /* ---------- le traducteur (js/traducteur.js) pose une composition confirmée : les blocs, la demande qui les a fait naître,
     et des liens dans l’ordre des demandes. Un même fragment proposé deux fois n’est posé qu’une fois. ---------- */
  A.grille = { poser: function (lot) {
    var y0 = hauteur(), poses = {}, prec = null, n = 0;
    lot.forEach(function (e) {
      e.blocs.forEach(function (p) {
        var k = p.type + ':' + p.ref, b = poses[k];
        if (!b) {
          if (p.deja || !existe(p)) return;
          var t = tailleDefaut(p.type, p.ref), q = placer(0, y0, t.w, t.h);
          b = { uid: 'b' + (++uid) + Date.now().toString(36), type: p.type, ref: p.ref, x: q.x, y: q.y, w: t.w, h: t.h, demandes: [] };
          etat.blocs.push(b); poses[k] = b; n++;
        }
        b.demandes.push({ phrase: e.phrase, intention: e.intention, reconnu: e.reconnu, manque: e.manque });
        if (prec && prec !== b && reseau(prec.uid).indexOf(b.uid) === -1) etat.liens.push([prec.uid, b.uid]);
        prec = b;
      });
    });
    if (n) { etat.mise = null; choisi = prec.uid; rendre(); sauver(); }
    return n;
  },
  /* une copie de la composition, en lecture : la publication (js/publier.js) en tire sa version publique */
  etat: function () { return JSON.parse(JSON.stringify(etat)); } };
  var aCompleter = function (b) { return !!b.demandes && !b.complet && b.demandes.some(function (d) { return d.manque && d.manque.length; }); };
  function ficheDemandes(b) {
    var NOMS = { pourqui: 'Pour qui', quand: 'Quand', lieu: 'Où', quantites: 'Combien', conditions: 'Conditions', format: 'Forme', ton: 'Ton' };
    return '<div class="fiche-demandes"><p class="surtitre">Né d’une demande</p>' + b.demandes.map(function (d) {
      var r = d.reconnu || {}, l = Object.keys(NOMS).map(function (k) { var v = r[k]; if (Array.isArray(v)) v = v.join(', '); return v ? '<div><dt>' + NOMS[k] + '</dt><dd>' + B.fr(v) + '</dd></div>' : ''; }).join('');
      return '<p><strong>' + B.fr(d.phrase) + '</strong></p>' + (l ? '<dl class="etude-liste">' + l + '</dl>' : '') +
        (d.manque && d.manque.length ? '<p>Il manque&nbsp;:</p><ul class="puces">' + d.manque.map(function (q) { return '<li>' + B.fr(q) + '</li>'; }).join('') + '</ul>' : '');
    }).join('') + (aCompleter(b) ? '<button type="button" class="opt" data-complet="' + b.uid + '">C’est complété</button>' : (b.complet ? '<p class="note-source">Marqué comme complété.</p>' : '')) +
      '<p class="note-source">Posé par le traducteur (js/traducteur.js) d’après la lecture du moteur. Une composition structurée : rien n’a été exécuté ni envoyé.</p></div>';
  }

  /* ---------- le réseau : les blocs reliés (et les parties d’une fusion) partagent ce qu’ils savent ---------- */
  var tous = function () { var l = []; etat.blocs.forEach(function (b) { l.push(b); if (b.type === 'fusion') l = l.concat(b.parts); }); return l; };
  var partie = function (id) { return tous().filter(function (x) { return x.uid === id; })[0]; };
  function reseau(id) {
    var vu = {}, pile = [id];
    while (pile.length) {
      var c = pile.pop(); if (vu[c]) continue; vu[c] = 1;
      etat.liens.forEach(function (l) { if (l[0] === c) pile.push(l[1]); if (l[1] === c) pile.push(l[0]); });
      etat.blocs.forEach(function (b) { if (b.type !== 'fusion') return; var ids = [b.uid].concat(b.parts.map(function (x) { return x.uid; })); if (ids.indexOf(c) !== -1) pile = pile.concat(ids); });
    }
    return Object.keys(vu);
  }
  var lie = function (b) { return etat.liens.some(function (l) { return l[0] === b.uid || l[1] === b.uid; }); };
  var ctx = { reseau: reseau, partie: partie, get donnees() { return etat.donnees; },
    changer: function (owner, champ, cible) {
      sauver(); rendre();
      var m = grille.querySelector('.module[data-owner="' + owner + '"]'); if (!m) return;
      var f = (cible && m.querySelector(cible)) || (champ && m.querySelector('[name="' + champ + '"]')); if (f) f.focus({ preventScroll: true });
    } };
  A.module.ecouter(grille, ctx);
  fiche.addEventListener('click', function (ev) {
    var c = ev.target.closest('[data-complet]'), b = c && trouveUid(c.getAttribute('data-complet')); if (!b) return;
    b.complet = true; rendre(); sauver();
  });

  /* ---------- un bloc dans la Charte ---------- */
  var STYLES = ['carte', 'sombre', 'nacre', 'grille', 'photo'];
  var NOM_STYLE = { carte: 'Carte', sombre: 'Sombre', nacre: 'Nacre', grille: 'Grille', photo: 'Photo', une: 'À la une', section: 'Section' };
  var styleDe = function (b) { return b.style || (b.type === 'brique' ? briques[b.ref].style : b.type === 'visuel' ? (b.w >= 9 ? 'une' : 'section') : 'carte'); };
  function contenu(b) {
    var st = styleDe(b), img = '';
    if (b.type === 'visuel' || st === 'photo') {
      var v = visuels[b.visuel] || (b.type === 'visuel' ? visuels[b.ref] : visuelDe(familleDe(b)));
      var ri = b.image, styleImg = ri ? 'object-position:' + ri.pos + ';filter:brightness(' + ri.lum / 100 + ') contrast(' + ri.con / 100 + ') saturate(' + ri.sat / 100 + ')' : (v.pos ? 'object-position:' + v.pos : '');
      img = '<img class="fond-bloc" src="' + B.esc(v.src) + '" alt="' + B.esc(v.alt) + '"' + (styleImg ? ' style="' + B.esc(styleImg) + '"' : '') + '>';
    }
    if (b.type === 'visuel') {
      var vv = visuels[b.ref];
      return img + '<div class="texte-visuel"><p class="sur">' + B.fr(vv.accroche) + '</p><h4>' + B.fr(vv.legende) + '</h4></div>';
    }
    if (b.type === 'module') return A.module.corps(b, ctx);
    if (b.type === 'fusion') return '<div class="fusion-panes" style="--n:' + b.parts.length + '">' + b.parts.map(function (x) { return '<div class="pane ' + x.type + ' ' + styleDe(x) + '">' + contenu(x) + '</div>'; }).join('<span class="couture" aria-hidden="true"></span>') + '</div>';
    if (b.type === 'brique') return img + B.brique(briques[b.ref]);
    var g = groupes[b.ref], e = etude(g), vo = voisins(b);
    return img + B.groupe(g) +
      '<div class="etude"><p class="role">' + B.fr(e.phrase) + '</p><p class="sens">' + B.fr(e.sens) + '</p>' +
      (vo.length ? '<p class="lien-voisins">À côté de ' + vo.map(function (o) { return '« ' + B.fr(nomDe(o)) + ' »'; }).join(', ') + '</p>' : '') + '</div>';
  }

  /* ---------- la grille ---------- */
  var cols = function () { return parseInt(getComputedStyle(grille).getPropertyValue('--col'), 10) || 12; };
  var u = function () { return 12 / cols(); };   /* unités de 12 par case affichée */
  function cssPos(r) { var k = u(); return 'grid-column:' + (Math.floor(r.x / k) + 1) + ' / span ' + Math.max(1, Math.ceil(r.w / k)) + ';grid-row:' + (r.y + 1) + ' / span ' + r.h; }
  var COINS = [['nw', 'en haut à gauche'], ['ne', 'en haut à droite'], ['sw', 'en bas à gauche'], ['se', 'en bas à droite']];
  function rendre() {
    var rangsG = Math.max(hauteur() + 3, 7);
    grille.style.gridTemplateRows = 'repeat(' + rangsG + ', var(--rang))';
    var html = etat.blocs.map(function (b) {
      var st = styleDe(b), nom = nomDe(b), surface = b.w * b.h, est = b.uid === choisi;
      var taille = surface >= 18 ? ' grand' : surface >= 9 ? ' moyen' : ' petit';
      return '<article class="bloc ' + b.type + ' ' + st + taille + (est ? ' choisi' : '') + (lie(b) || b.type === 'fusion' ? ' relie' : '') + (relier && relier !== b.uid ? ' a-relier' : '') + '" tabindex="0" data-uid="' + b.uid + '" style="' + cssPos(b) + '" aria-label="' + B.esc(nom) + ', colonne ' + (b.x + 1) + ', rangée ' + (b.y + 1) + ', ' + b.w + ' sur ' + b.h + (aCompleter(b) ? ', à compléter' : '') + (est ? ', choisi' : '') + '">' +
        '<div class="poignee" aria-hidden="true"></div>' + contenu(b) + (aCompleter(b) ? '<span class="a-completer">À compléter</span>' : '') +
        (est ? COINS.map(function (c) { return '<span class="coin coin-' + c[0] + '" data-coin="' + c[0] + '" aria-hidden="true" title="Agrandir par le coin ' + c[1] + '"></span>'; }).join('') : '') + '</article>';
    }).join('');
    grille.innerHTML = '<div class="aimant" id="aimant" hidden></div>' + (html || '<p class="vide-grille">Glissez un fragment ou un visuel ici, ou choisissez une mise en page.</p>');
    aimant = document.getElementById('aimant');
    fils();
    var n = etat.blocs.length; compte.textContent = n ? n + ' bloc' + (n > 1 ? 's' : '') + ' sur la grille' : 'La grille est vide';
    Array.prototype.forEach.call(document.querySelectorAll('[data-mise]'), function (o) { o.setAttribute('aria-pressed', String(o.getAttribute('data-mise') === etat.mise)); });
    arbre(); outils();
  }

  /* ---------- les fils : entre deux blocs reliés, une lumière arc-en-ciel qui passe de l’un à l’autre ---------- */
  var haut = function (id) { var t = trouveUid(id); if (t) return t; return etat.blocs.filter(function (b) { return b.type === 'fusion' && b.parts.some(function (x) { return x.uid === id; }); })[0]; };
  function fils() {
    var traits = etat.liens.map(function (l) {
      var a = haut(l[0]), b = haut(l[1]); if (!a || !b || a === b) return '';
      var ea = grille.querySelector('[data-uid="' + a.uid + '"]'), eb = grille.querySelector('[data-uid="' + b.uid + '"]'); if (!ea || !eb) return '';
      var x1 = ea.offsetLeft + ea.offsetWidth / 2, y1 = ea.offsetTop + ea.offsetHeight / 2, x2 = eb.offsetLeft + eb.offsetWidth / 2, y2 = eb.offsetTop + eb.offsetHeight / 2;
      var d = 'M' + x1 + ' ' + y1 + ' C' + x1 + ' ' + (y1 + y2) / 2 + ' ' + x2 + ' ' + (y1 + y2) / 2 + ' ' + x2 + ' ' + y2;
      return '<path class="fil" d="' + d + '"/><path class="fil-lumiere" d="' + d + '"/>';
    }).join('');
    if (!traits) return;
    grille.insertAdjacentHTML('beforeend', '<svg class="fils" aria-hidden="true" width="' + grille.scrollWidth + '" height="' + grille.scrollHeight + '"><defs><linearGradient id="arc-fil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--orbe-lecture-1)"/><stop offset=".2" stop-color="var(--orbe-lecture-2)"/><stop offset=".4" stop-color="var(--libre)"/><stop offset=".6" stop-color="var(--orbe-grand-1)"/><stop offset=".8" stop-color="var(--nacre-rose)"/><stop offset="1" stop-color="var(--orbe-ecoute)"/></linearGradient></defs>' + traits + '</svg>');
  }

  /* ---------- le bloc choisi : sa barre d’actions sous lui, sa fiche sous la grille ---------- */
  var trouveUid = function (id) { return etat.blocs.filter(function (x) { return x.uid === id; })[0]; };
  function outils() {
    var b = trouveUid(choisi);
    if (!b) { choisi = null; barre.hidden = true; fiche.hidden = true; return; }
    var el = grille.querySelector('[data-uid="' + b.uid + '"]'), zone = barre.parentNode.getBoundingClientRect(), r = el.getBoundingClientRect();
    var st = styleDe(b), photo = b.type === 'visuel' || st === 'photo';
    var mod = b.type === 'module', fus = b.type === 'fusion', ri = b.image || { pos: 'center', lum: 100, con: 100, sat: 100 };
    var POS = [['center', 'Centre'], ['top', 'Haut'], ['bottom', 'Bas'], ['left', 'Gauche'], ['right', 'Droite']];
    barre.innerHTML = '<p class="barre-nom">' + B.fr(nomDe(b)) + ' <small>' + b.w + ' × ' + b.h + '</small></p>' +
      (relier === b.uid ? '<p class="barre-aide" role="status">Touchez le bloc à relier.</p><button type="button" data-act="annuler-lien">Annuler</button>' :
      '<button type="button" data-act="taille">Taille</button>' +
      (mod || fus ? '' : '<button type="button" data-act="style">Style · ' + NOM_STYLE[st] + '</button><button type="button" data-act="visuel"' + (photo ? '' : ' title="Passe le bloc en photo"') + '>Visuel</button>') +
      (photo && !fus ? '<button type="button" data-act="image" aria-expanded="' + reglage + '">Image</button>' : '') +
      '<button type="button" data-act="relier" class="arc-btn">Relier</button>' +
      (lie(b) ? '<button type="button" data-act="delier">Délier</button><button type="button" data-act="fusionner">Fusionner</button>' : '') +
      (fus ? '<button type="button" data-act="separer">Séparer</button>' : '') +
      (mod || fus ? '' : '<button type="button" data-act="une">À la une</button>') +
      (fus ? '' : '<button type="button" data-act="dupliquer">Dupliquer</button>') +
      '<button type="button" data-act="retirer">Retirer</button>') +
      (reglage && photo && !fus && relier !== b.uid ? '<div class="reglages-image" role="group" aria-label="Réglages de l’image">' +
        '<label><span>Cadrage</span><select class="champ" data-reg="pos">' + POS.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === ri.pos ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>' +
        [['lum', 'Luminosité'], ['con', 'Contraste'], ['sat', 'Saturation']].map(function (o) { return '<label><span>' + o[1] + '</span><output>' + ri[o[0]] + '</output><input type="range" min="0" max="200" value="' + ri[o[0]] + '" data-reg="' + o[0] + '"></label>'; }).join('') +
        '<button type="button" data-act="image-zero">Revenir à l’original</button></div>' : '');
    barre.hidden = false;
    var haut = r.bottom - zone.top + barre.parentNode.scrollTop + 8, gauche = Math.max(0, Math.min(r.left - zone.left + barre.parentNode.scrollLeft, barre.parentNode.scrollWidth - barre.offsetWidth));
    barre.style.top = haut + 'px'; barre.style.left = gauche + 'px';
    ficheDe(b);
  }
  function ficheDe(b) {
    var h = '';
    if (b.type === 'groupe') {
      var g = groupes[b.ref], e = etude(g), noms = Object.keys(g.noms);
      h = '<p class="surtitre">' + B.pastille(g.famille) + ' ' + B.fr(B.nomFamille(g.famille)) + ' · ' + e.total + ' noms dans la famille</p><h3 class="titre">' + B.fr(g.nom) + '</h3>' +
        '<dl class="etude-liste"><div><dt>Versions</dt><dd>' + g.n + '</dd></div><div><dt>Première</dt><dd>' + B.date(g.premier) + '</dd></div><div><dt>Dernière</dt><dd>' + B.date(g.dernier) + '</dd></div>' +
        (e.chapitre ? '<div><dt>Époque</dt><dd><a href="chronologie.html#' + e.chapitre.id + '">' + B.fr(e.chapitre.titre) + '</a></dd></div>' : '') + '</dl>' +
        '<p>' + B.fr(e.phrase) + '</p><p>' + B.fr(e.sens) + '</p>' +
        (noms.length > 1 ? '<ul class="puces">' + noms.map(function (n) { return '<li>' + B.fr(n) + '</li>'; }).join('') + '</ul>' : '') +
        '<p class="note-source">D’après les dates de création Base44 (data/applications.js). Le sens vient de la brique de sa famille (data/achevement.js) : une lecture, pas un état.</p>';
    } else if (b.type === 'brique') {
      var br = briques[b.ref], top = parFamille[br.famille].groupes.slice().sort(function (a, c) { return c.n - a.n; }).slice(0, 6);
      h = '<p class="surtitre">' + B.pastille(br.famille) + ' Brique · ' + B.fr(B.nomFamille(br.famille)) + '</p><h3 class="titre">' + B.fr(br.titre) + '</h3><p>' + B.fr(br.role) + '</p>' +
        '<dl class="etude-liste"><div><dt>Tentatives</dt><dd>' + br.tentatives + '</dd></div><div><dt>Part des 643</dt><dd>' + Math.round(br.tentatives / A.applications.length * 100) + '&nbsp;%</dd></div><div><dt>Noms distincts</dt><dd>' + parFamille[br.famille].groupes.length + '</dd></div></dl>' +
        '<p>Les plus recommencés&nbsp;:</p><ul class="puces">' + top.map(function (g) { return '<li>' + B.fr(g.nom) + (g.n > 1 ? ' ×' + g.n : '') + '</li>'; }).join('') + '</ul>';
    } else if (b.type === 'module') {
      var md = modules[b.ref], n = A.applications.filter(function (a) { return md.motif.test(a[1]); }), noms = {};
      n.forEach(function (a) { noms[base(a[1])] = (noms[base(a[1])] || 0) + 1; });
      var net = reseau(b.uid).map(partie).filter(function (x) { return x && x.uid !== b.uid; });
      h = '<p class="surtitre">' + B.pastille(md.famille) + ' Module · ' + B.fr(B.nomFamille(md.famille)) + '</p><h3 class="titre">' + B.fr(md.titre) + '</h3><p>' + B.fr(md.role) + '</p>' +
        '<dl class="etude-liste"><div><dt>Applications au nom proche</dt><dd>' + n.length + '</dd></div><div><dt>Capacités de l’atlas</dt><dd>' + md.capacites.length + '</dd></div><div><dt>Relié à</dt><dd>' + net.length + '</dd></div></dl>' +
        (Object.keys(noms).length ? '<p>Recréé sous ces noms&nbsp;:</p><ul class="puces">' + Object.keys(noms).slice(0, 8).map(function (k) { return '<li>' + B.fr(k) + (noms[k] > 1 ? ' ×' + noms[k] : '') + '</li>'; }).join('') + '</ul>' : '<p>Aucune application ne porte ce mot dans son nom : le module vient des capacités de l’atlas.</p>') +
        (md.capacites.length ? '<p>Capacités de l’atlas Base44&nbsp;: ' + md.capacites.map(function (c) { return '« ' + B.fr(c) + ' »'; }).join(', ') + '.</p>' : '') +
        (md.regle ? '<p>' + B.fr(md.regle) + '</p>' : '') +
        (net.length ? '<p>Dans son réseau&nbsp;: ' + net.map(function (x) { return '« ' + B.fr(nomDe(x)) + ' »'; }).join(', ') + '. Ce que l’un sait, les autres le lisent.</p>' : '<p>Reliez-le à un autre module : la lumière passe de l’un à l’autre, et leurs données avec elle.</p>') +
        '<p class="note-source">Sources : entité Capability de l’application « Atlas Base44 Matt Mez », noms de data/applications.js. Les données saisies restent sur cet appareil.</p>';
    } else if (b.type === 'fusion') {
      h = '<p class="surtitre">Fusion · ' + b.parts.length + ' blocs</p><h3 class="titre">' + B.fr(nomDe(b)) + '</h3><p>Un seul bloc, une seule place, des données partagées. « Séparer » rend chaque partie à la grille, toujours reliées.</p>';
    } else {
      var v = visuels[b.ref];
      h = '<p class="surtitre">Visuel · ' + B.fr(v.accroche) + '</p><h3 class="titre">' + B.fr(v.legende) + '</h3><p>' + B.fr(v.alt) + '.</p>' +
        '<p>Il habille la famille « ' + B.fr(B.nomFamille(v.famille)) + ' ». Large (9 colonnes et plus), il devient une une : le titre en grand, en blanc. Plus étroit, une section.</p><p class="note-source">Source&nbsp;: <code>' + B.esc(v.src) + '</code>, photographie de LEMONDEAIME.</p>';
    }
    if (b.demandes) h += ficheDemandes(b);
    fiche.innerHTML = h; fiche.hidden = false;
  }
  function choisir(b, focus) {
    if (!b || b.uid !== choisi) reglage = false;
    choisi = b ? b.uid : null; rendre();
    if (b && focus !== false) { var el = grille.querySelector('[data-uid="' + b.uid + '"]'); if (el) el.focus({ preventScroll: true }); }
  }

  /* ---------- glisser : à la souris, au doigt, au stylet (pointer events) ---------- */
  var drag = null;
  function cellule(ev, w, brut) {
    var r = grille.getBoundingClientRect(), cs = getComputedStyle(grille);
    var gap = parseFloat(cs.getPropertyValue('--ecart')) || 12, rang = parseFloat(cs.getPropertyValue('--rang')) || 72, c = cols();
    if (!brut && (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom)) return null;
    var colW = (r.width - gap * (c + 1)) / c;
    var cx = Math.floor((ev.clientX - r.left - gap / 2) / (colW + gap)), cy = Math.floor((ev.clientY - r.top - gap / 2) / (rang + gap));
    if (brut) return { x: Math.max(0, Math.min(11, cx * u())), y: Math.max(0, cy) };
    var k = u(); return { x: Math.max(0, Math.min(12 - w, cx * k - (drag && drag.decal ? drag.decal : 0))), y: Math.max(0, cy - (drag && drag.decalY ? drag.decalY : 0)) };
  }
  function debut(ev, source) {
    if (ev.button !== undefined && ev.button !== 0) return;
    drag = source; drag.x0 = ev.clientX; drag.y0 = ev.clientY; drag.bouge = false;
    try { ev.target.setPointerCapture(ev.pointerId); } catch (e) { /* ancien navigateur */ }
  }
  function bouger(ev) {
    if (!drag) return;
    if (!drag.bouge && Math.abs(ev.clientX - drag.x0) + Math.abs(ev.clientY - drag.y0) < 6) return;
    if (drag.coin) { ev.preventDefault(); drag.bouge = true; redimensionner(ev); return; }
    if (!drag.bouge) {
      drag.bouge = true;
      drag.fantome = document.createElement('div'); drag.fantome.className = 'fantome'; drag.fantome.textContent = drag.nom; document.body.appendChild(drag.fantome);
      if (drag.bloc) { var el = grille.querySelector('[data-uid="' + drag.bloc.uid + '"]'); if (el) el.classList.add('leve'); barre.hidden = true; }
    }
    ev.preventDefault();
    drag.fantome.style.left = (ev.clientX + 12) + 'px'; drag.fantome.style.top = (ev.clientY + 12) + 'px';
    var c = cellule(ev, drag.w);
    if (!c) { aimant.hidden = true; return; }
    var p = placer(c.x, c.y, drag.w, drag.h, drag.bloc);
    aimant.hidden = false; aimant.style.cssText = cssPos({ x: p.x, y: p.y, w: drag.w, h: drag.h });
    aimant.classList.toggle('refus', p.x !== c.x || p.y !== c.y);
    drag.cible = p;
  }
  /* agrandir par un coin : le coin opposé reste en place, la taille suit le doigt, case par case */
  function redimensionner(ev) {
    var d = drag, b = d.bloc, c = cellule(ev, 1, true), k = u();
    var ouest = d.coin.indexOf('w') !== -1, nord = d.coin.indexOf('n') !== -1;
    var x0 = ouest ? d.r.x + d.r.w : d.r.x, y0 = nord ? d.r.y + d.r.h : d.r.y;
    var x1 = ouest ? Math.min(c.x, x0 - 2) : Math.max(c.x + k, x0 + 2), y1 = nord ? Math.min(c.y, y0 - 1) : Math.max(c.y + 1, y0 + 1);
    x1 = Math.max(0, Math.min(12, x1)); y1 = Math.max(0, y1);
    var r = { x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) };
    if (r.w < 2 || r.h < 1) return;
    aimant.hidden = false; aimant.style.cssText = cssPos(r);
    var ok = libre(r, b); aimant.classList.toggle('refus', !ok);
    if (ok) d.cible = r;
  }
  function fin(ev) {
    if (!drag) return;
    var d = drag; drag = null;
    if (d.fantome) d.fantome.remove();
    aimant.hidden = true;
    if (d.coin) { if (d.cible) { d.bloc.x = d.cible.x; d.bloc.y = d.cible.y; d.bloc.w = d.cible.w; d.bloc.h = d.cible.h; etat.mise = null; sauver(); } rendre(); return; }
    if (!d.bouge) {
      if (d.bloc && relier) {                                          /* en train de relier : le bloc touché rejoint le réseau */
        if (d.bloc.uid !== relier && reseau(relier).indexOf(d.bloc.uid) === -1) etat.liens.push([relier, d.bloc.uid]);
        choisi = relier; relier = null; rendre(); sauver(); return;
      }
      if (d.bloc) choisir(d.bloc.uid === choisi ? null : d.bloc);      /* toucher un bloc le choisit, le toucher encore le relâche */
      else ajouter(d.type, d.ref);                                     /* toucher un fragment le pose à la première place libre */
      return;
    }
    var dans = cellule(ev, d.w);
    if (!dans || !d.cible) { rendre(); return; }
    etat.mise = null;
    if (d.bloc) { d.bloc.x = d.cible.x; d.bloc.y = d.cible.y; choisi = d.bloc.uid; rendre(); sauver(); }
    else ajouter(d.type, d.ref, d.cible.x, d.cible.y);
  }
  zoneFamilles.addEventListener('pointerdown', function (ev) {
    var f = ev.target.closest('.fragment'); if (!f) return;
    if (f.hasAttribute('data-m')) { var md = modules[f.getAttribute('data-m')]; debut(ev, { type: 'module', ref: md.id, nom: md.titre, w: md.w, h: md.h }); return; }
    if (f.hasAttribute('data-v')) { var v = visuels[f.getAttribute('data-v')]; debut(ev, { type: 'visuel', ref: v.id, nom: v.legende, w: 6, h: 3 }); return; }
    var g = groupes[f.getAttribute('data-g')];
    debut(ev, { type: 'groupe', ref: g.id, nom: g.nom, w: 3, h: 2 });
  });
  zoneFamilles.addEventListener('keydown', function (ev) {
    var f = ev.target.closest('.fragment'); if (!f || (ev.key !== 'Enter' && ev.key !== ' ')) return;
    ev.preventDefault();
    if (f.hasAttribute('data-m')) ajouter('module', f.getAttribute('data-m')); else if (f.hasAttribute('data-v')) ajouter('visuel', f.getAttribute('data-v')); else ajouter('groupe', f.getAttribute('data-g'));
  });
  grille.addEventListener('pointerdown', function (ev) {
    var coin = ev.target.closest('.coin'), p = ev.target.closest('.poignee');
    if (!coin && !p) { if (!ev.target.closest('.bloc') && choisi) choisir(null); return; }
    var el = (coin || p).parentNode, b = trouveUid(el.getAttribute('data-uid')); if (!b) return;
    if (coin) { ev.preventDefault(); debut(ev, { bloc: b, coin: coin.getAttribute('data-coin'), r: { x: b.x, y: b.y, w: b.w, h: b.h } }); return; }
    var c = cellule(ev, b.w);
    debut(ev, { bloc: b, nom: nomDe(b), w: b.w, h: b.h, decal: c ? Math.max(0, c.x - b.x) : 0, decalY: c ? Math.max(0, c.y - b.y) : 0 });
  });
  document.addEventListener('pointermove', bouger, { passive: false });
  document.addEventListener('pointerup', fin);
  document.addEventListener('pointercancel', function () { if (drag && drag.fantome) drag.fantome.remove(); drag = null; aimant.hidden = true; rendre(); });

  /* ---------- les actions du bloc choisi ---------- */
  var TAILLES = [[3, 2], [6, 2], [4, 3], [6, 3], [8, 4], [12, 2], [12, 4]];
  function agir(act, b) {
    if (act === 'retirer') {
      var partis = [b.uid].concat(b.type === 'fusion' ? b.parts.map(function (x) { return x.uid; }) : []), hors = function (x) { return partis.indexOf(x.owner) === -1; };
      etat.blocs = etat.blocs.filter(function (x) { return x !== b; }); choisi = null;
      etat.liens = etat.liens.filter(function (l) { return partis.indexOf(l[0]) === -1 && partis.indexOf(l[1]) === -1; });
      var D = etat.donnees; ['moments', 'invites', 'documents', 'morceaux', 'photos', 'missions'].forEach(function (k) { if (D[k]) D[k] = D[k].filter(hors); });
    }
    else if (act === 'relier') { relier = b.uid; reglage = false; }
    else if (act === 'annuler-lien') relier = null;
    else if (act === 'delier') { var ids = [b.uid].concat(b.type === 'fusion' ? b.parts.map(function (x) { return x.uid; }) : []); etat.liens = etat.liens.filter(function (l) { return ids.indexOf(l[0]) === -1 && ids.indexOf(l[1]) === -1; }); }
    else if (act === 'fusionner') { fusionner(b); return; }
    else if (act === 'separer') { separer(b); return; }
    else if (act === 'image') reglage = !reglage;
    else if (act === 'image-zero') delete b.image;
    else if (act === 'taille') {
      var i = TAILLES.findIndex(function (t) { return t[0] === b.w && t[1] === b.h; }), t = TAILLES[(i + 1) % TAILLES.length];
      b.w = t[0]; b.h = t[1]; var p = placer(b.x, b.y, b.w, b.h, b); b.x = p.x; b.y = p.y; etat.mise = null;
    } else if (act === 'style') {
      var liste = b.type === 'visuel' ? ['une', 'section'] : STYLES, s = liste[(liste.indexOf(styleDe(b)) + 1) % liste.length];
      b.style = s;
      if (b.type === 'visuel') { if (s === 'une' && b.w < 9) { b.w = 12; b.h = Math.max(b.h, 4); } if (s === 'section' && b.w >= 9) b.w = 6; var q = placer(b.x, b.y, b.w, b.h, b); b.x = q.x; b.y = q.y; }
    } else if (act === 'visuel') {
      if (b.type === 'visuel') { var k = A.visuels.indexOf(visuels[b.ref]); b.ref = A.visuels[(k + 1) % A.visuels.length].id; }
      else { var cur = b.visuel || (styleDe(b) === 'photo' ? visuelDe(familleDe(b)).id : null), j = cur ? A.visuels.indexOf(visuels[cur]) + 1 : A.visuels.indexOf(visuelDe(familleDe(b))); b.style = 'photo'; b.visuel = A.visuels[j % A.visuels.length].id; }
    } else if (act === 'une') {
      etat.blocs = [b].concat(etat.blocs.filter(function (x) { return x !== b; }));
      disposer('une', true); return;
    } else if (act === 'dupliquer') {
      var c = { uid: 'b' + (++uid) + Date.now().toString(36), type: b.type, ref: b.ref, w: b.w, h: b.h, style: b.style, visuel: b.visuel }, r = placer(b.x + b.w, b.y, b.w, b.h);
      c.x = r.x; c.y = r.y; etat.blocs.push(c); choisi = c.uid;
    }
    rendre(); sauver();
    var el = choisi && grille.querySelector('[data-uid="' + choisi + '"]'); if (el) el.focus({ preventScroll: true });
  }
  /* fusionner : les blocs reliés deviennent un seul bloc, à la place qu’ils occupaient ensemble ; séparer les rend */
  function fusionner(b) {
    var membres = []; reseau(b.uid).forEach(function (id) { var h = haut(id); if (h && membres.indexOf(h) === -1) membres.push(h); });
    if (membres.length < 2) return;
    var x0 = Math.min.apply(null, membres.map(function (m) { return m.x; })), y0 = Math.min.apply(null, membres.map(function (m) { return m.y; }));
    var x1 = Math.max.apply(null, membres.map(function (m) { return m.x + m.w; })), y1 = Math.max.apply(null, membres.map(function (m) { return m.y + m.h; }));
    var parts = []; membres.forEach(function (m) { parts = parts.concat(m.type === 'fusion' ? m.parts : [m]); });
    etat.blocs = etat.blocs.filter(function (x) { return membres.indexOf(x) === -1; });
    var f = { uid: 'f' + (++uid) + Date.now().toString(36), type: 'fusion', parts: parts.map(function (x) { return { uid: x.uid, type: x.type, ref: x.ref, w: x.w, h: x.h, style: x.style, visuel: x.visuel, image: x.image, mois: x.mois, jour: x.jour }; }), w: Math.min(12, x1 - x0), h: Math.max(y1 - y0, Math.max.apply(null, parts.map(function (x) { return x.h; }))) };
    var p = placer(x0, y0, f.w, f.h); f.x = p.x; f.y = p.y;
    etat.blocs.push(f); choisi = f.uid; etat.mise = null; rendre(); sauver();
  }
  function separer(f) {
    etat.blocs = etat.blocs.filter(function (x) { return x !== f; });
    f.parts.forEach(function (x) { var p = placer(f.x, f.y, x.w, x.h); x.x = p.x; x.y = p.y; etat.blocs.push(x); });
    for (var i = 1; i < f.parts.length; i++) if (!etat.liens.some(function (l) { return reseau(f.parts[0].uid).indexOf(f.parts[i].uid) !== -1; })) etat.liens.push([f.parts[i - 1].uid, f.parts[i].uid]);
    choisi = f.parts[0].uid; etat.mise = null; rendre(); sauver();
  }
  /* les réglages de l’image, en direct (comme le panneau Image du design system) */
  barre.addEventListener('input', function (ev) {
    var r = ev.target.closest('[data-reg]'), b = trouveUid(choisi); if (!r || !b) return;
    b.image = b.image || { pos: 'center', lum: 100, con: 100, sat: 100 };
    b.image[r.getAttribute('data-reg')] = r.tagName === 'SELECT' ? r.value : +r.value;
    var o = r.parentNode.querySelector('output'); if (o) o.textContent = r.value;
    var img = grille.querySelector('[data-uid="' + b.uid + '"] .fond-bloc');
    if (img) { img.style.objectPosition = b.image.pos; img.style.filter = 'brightness(' + b.image.lum / 100 + ') contrast(' + b.image.con / 100 + ') saturate(' + b.image.sat / 100 + ')'; }
  });
  barre.addEventListener('change', function (ev) { if (ev.target.closest('[data-reg]')) sauver(); });
  barre.addEventListener('click', function (ev) { var btn = ev.target.closest('[data-act]'), b = trouveUid(choisi); if (btn && b) agir(btn.getAttribute('data-act'), b); });
  grille.addEventListener('keydown', function (ev) {
    var el = ev.target.closest('.bloc'); if (!el || ev.target !== el) return;
    var b = trouveUid(el.getAttribute('data-uid')); if (!b) return;
    if ((ev.key === 'Enter' || ev.key === ' ') && relier) { ev.preventDefault(); if (b.uid !== relier && reseau(relier).indexOf(b.uid) === -1) etat.liens.push([relier, b.uid]); choisi = relier; relier = null; rendre(); sauver(); return; }
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); choisir(b.uid === choisi ? null : b); return; }
    if (ev.key === 'Escape') { relier = null; choisir(null); return; }
    if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); agir('retirer', b); return; }
    var k = u(), dx = { ArrowLeft: -k, ArrowRight: k }[ev.key] || 0, dy = { ArrowUp: -1, ArrowDown: 1 }[ev.key] || 0;
    if (!dx && !dy) return;
    ev.preventDefault();
    /* Maj + flèches : agrandir ou réduire ; flèches seules : déplacer */
    var r = ev.shiftKey ? { x: b.x, y: b.y, w: Math.max(2, Math.min(12 - b.x, b.w + dx)), h: Math.max(1, b.h + dy) } : { x: Math.max(0, Math.min(12 - b.w, b.x + dx)), y: Math.max(0, b.y + dy), w: b.w, h: b.h };
    if (libre(r, b)) { b.x = r.x; b.y = r.y; b.w = r.w; b.h = r.h; etat.mise = null; choisi = b.uid; rendre(); sauver(); }
    var n = grille.querySelector('[data-uid="' + b.uid + '"]'); if (n) n.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && (choisi || relier)) { relier = null; choisir(null, false); } });

  /* ---------- les mises en page : les mêmes blocs, une autre composition, en un clic ---------- */
  var MISES = {
    une: { tete: [[12, 4]], suite: [[4, 3]] },
    magazine: { tete: [[8, 4], [4, 2], [4, 2]], suite: [[6, 3], [3, 3], [3, 3], [4, 2], [4, 2], [4, 2]] },
    bento: { tete: [[6, 4], [6, 2], [3, 2], [3, 2]], suite: [[4, 3], [4, 3], [4, 3], [3, 2], [3, 2], [6, 2]] },
    mosaique: { tete: [], suite: [[6, 4], [3, 2], [3, 2], [3, 2], [3, 2], [4, 3], [8, 3], [3, 4], [5, 2], [4, 2], [4, 2], [6, 3], [6, 3]] },
    grille: { tete: [], suite: [[3, 2]] },
    colonne: { tete: [], suite: [[12, 2]] }
  };
  function disposer(nom, garderOrdre) {
    if (!etat.blocs.length) composerAchevement();
    var m = MISES[nom], ordre = etat.blocs.slice();
    if (!garderOrdre) ordre.sort(function (a, b) { return a.y - b.y || a.x - b.x; });
    if (nom === 'une' && !garderOrdre) {
      /* à la une : un visuel en tête ; s’il n’y en a pas, celui de la famille la plus présente */
      var v = ordre.filter(function (b) { return b.type === 'visuel'; })[0];
      if (!v) {
        var cpt = {}; ordre.forEach(function (b) { var f = familleDe(b); cpt[f] = (cpt[f] || 0) + 1; });
        var f = Object.keys(cpt).sort(function (a, b) { return cpt[b] - cpt[a]; })[0];
        v = { uid: 'b' + (++uid) + Date.now().toString(36), type: 'visuel', ref: visuelDe(f).id };
      }
      ordre = [v].concat(ordre.filter(function (b) { return b !== v; }));
    }
    etat.blocs = [];
    ordre.forEach(function (b, i) {
      var t = i < m.tete.length ? m.tete[i] : m.suite[(i - m.tete.length) % m.suite.length];
      b.w = t[0]; b.h = t[1]; if (b.type === 'module' || b.type === 'fusion') { b.w = Math.max(b.w, 4); b.h = Math.max(b.h, 4); } if (b.type === 'visuel') b.style = b.w >= 9 ? 'une' : 'section';
      var p = placer(0, 0, b.w, b.h); b.x = p.x; b.y = p.y; etat.blocs.push(b);
    });
    etat.mise = nom; rendre(); sauver();
  }
  function composerAchevement() {
    etat.blocs = [];
    var liste = ACH.briques.slice();
    if (etat.inverse) {
      /* le moins tenté d’abord : les briques se posent dans cet ordre, chacune à la première place libre */
      liste.sort(function (a, b) { return a.tentatives - b.tentatives; });
      liste.forEach(function (br) { var p = placer(0, 0, br.w, br.h); etat.blocs.push({ uid: 'a' + br.id, type: 'brique', ref: br.id, x: p.x, y: p.y, w: br.w, h: br.h }); });
    } else {
      liste.forEach(function (br) { etat.blocs.push({ uid: 'a' + br.id, type: 'brique', ref: br.id, x: br.x, y: br.y, w: br.w, h: br.h }); });
    }
  }
  function composer() { choisi = null; composerAchevement(); etat.mise = 'achevement'; rendre(); sauver(); }
  document.getElementById('mises').addEventListener('click', function (ev) {
    var o = ev.target.closest('[data-mise]'); if (!o) return;
    var nom = o.getAttribute('data-mise');
    if (nom === 'achevement') composer(); else disposer(nom);
  });
  var inv = document.getElementById('inverser');
  inv.addEventListener('click', function () { etat.inverse = !etat.inverse; inv.setAttribute('aria-pressed', String(etat.inverse)); composer(); });
  document.getElementById('vider').addEventListener('click', function () { etat.blocs = []; choisi = null; etat.mise = null; rendre(); sauver(); });

  /* ---------- les recettes : une composition gardée sous un nom, rechargée, exportée ---------- */
  var CLE_R = 'atlas-recettes-v1', selR = document.getElementById('recettes');
  var recettes = function () { try { return JSON.parse(localStorage.getItem(CLE_R) || '[]'); } catch (e) { return []; } };
  function listeRecettes() { var r = recettes(); selR.innerHTML = '<option value="">Recettes (' + r.length + ')</option>' + r.map(function (x, i) { return '<option value="' + i + '">' + B.esc(x.nom) + ' · ' + x.blocs.length + ' blocs</option>'; }).join(''); }
  var composition = function (nom) { return { format: 'atlas-recette', version: 1, nom: nom, creeLe: new Date().toISOString(), blocs: JSON.parse(JSON.stringify(etat.blocs)), liens: JSON.parse(JSON.stringify(etat.liens)), mise: etat.mise }; };
  function appliquer(r) { if (!r || !Array.isArray(r.blocs)) return; etat.blocs = r.blocs.filter(existe); etat.liens = (r.liens || []).filter(function (l) { return partie(l[0]) && partie(l[1]); }); etat.mise = r.mise || null; choisi = null; rendre(); sauver(); }
  document.getElementById('recette-garder').addEventListener('click', function () {
    var nom = prompt('Nom de la recette', 'Le Jour J complet'); if (!nom) return;
    var r = recettes(); r.push(composition(nom.trim())); try { localStorage.setItem(CLE_R, JSON.stringify(r)); } catch (e) { alert('L’espace du navigateur est plein.'); } listeRecettes(); selR.value = String(r.length - 1);
  });
  selR.addEventListener('change', function () { var r = recettes()[+selR.value]; if (selR.value !== '' && r && confirm('Recomposer la grille avec « ' + r.nom + ' » ? La grille actuelle est remplacée.')) appliquer(r); });
  document.getElementById('recette-exporter').addEventListener('click', function () {
    var r = recettes()[+selR.value] || composition('Composition du ' + new Date().toLocaleDateString('fr-FR'));
    var url = URL.createObjectURL(new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' })), a = document.createElement('a');
    a.href = url; a.download = 'recette-' + r.nom.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  });
  document.getElementById('recette-importer').addEventListener('change', function (ev) {
    var f = ev.target.files[0]; if (!f) return;
    f.text().then(function (t) { var r = JSON.parse(t); if (r.format !== 'atlas-recette') throw new Error(); var l = recettes(); l.push(r); localStorage.setItem(CLE_R, JSON.stringify(l)); listeRecettes(); appliquer(r); })
      .catch(function () { alert('Ce fichier n’est pas une recette de la Métamorphose.'); });
    ev.target.value = '';
  });
  listeRecettes();

  /* ---------- départ : la composition gardée, sinon l’achèvement ---------- */
  if (charger()) { inv.setAttribute('aria-pressed', String(!!etat.inverse)); rendre(); } else composer();
  var rafR = 0; window.addEventListener('resize', function () { cancelAnimationFrame(rafR); rafR = requestAnimationFrame(rendre); });
})();
