/* Le Récit du Cube : l’accueil d’ATLAS en une seule page.
   - La scène reste au centre de l’écran ; le récit défile par-dessus, station après station, dans l’ordre du temps :
     Saint-Luc (Archives), 1999 – 2025 (Chronologie), les époques de 2025 – 2026 et Demain, puis la Composition, les Relations,
     les Modules, l’Écosystème, et la fin : le Cube se déplie en croix et devient la grille des blocs.
   - À chaque station, le Cube tourne vers sa face et remplit ses cases mosaïques avec les fragments de la station
     (une tuile peut couvrir plusieurs cases) ; la carte de la station dit la même chose en texte, avec ses liens.
   - Derrière le Cube, la projection : le grand visuel et le grand titre blanc de la station.
   - Tout vient des données : data/chronologie.js, data/histoire.js, data/visuels.js, data/applications.js, data/modules.js,
     data/projets.js, data/achevement.js. Ce qui est proposé et pas engagé (Demain) est dit comme tel.
   - Le Cube suit le défilement ; on peut aussi le saisir (il revient à sa place en le lâchant). « MATT MEZ », derrière lui,
     est redessiné grossi dans sa silhouette (la loupe), au début du récit seulement. */
(function () {
  var A = window.ATLAS, C = A.chronologie, H = A.histoire, B = A.bloc;
  var esc = B.esc, fr = B.fr;
  var calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var VIS = {}, VFAM = {}; (A.visuels || []).forEach(function (v) { VIS[v.id] = v; if (!VFAM[v.famille]) VFAM[v.famille] = v; });
  var MOT = { avant: 'Chronologie', droite: 'Composition', arriere: 'Archives', gauche: 'Relations', haut: 'Modules', bas: 'Écosystème' };
  var ORIENT = { avant: [0, 0], droite: [0, -90], arriere: [0, -180], gauche: [0, -270], haut: [-90, 0], bas: [90, 0] };
  /* les mosaïques : [x, y, largeur, hauteur] sur une grille n × n */
  var MOTIFS = {
    neuf: { n: 3, cases: [[0,0,1,1],[1,0,1,1],[2,0,1,1],[0,1,1,1],[1,1,1,1],[2,1,1,1],[0,2,1,1],[1,2,1,1],[2,2,1,1]] },
    une: { n: 3, cases: [[0,0,2,2],[2,0,1,1],[2,1,1,1],[0,2,1,1],[1,2,1,1],[2,2,1,1]] },
    seize: { n: 4, cases: (function () { var c = []; for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) c.push([x, y, 1, 1]); return c; })() }
  };
  var annee = function (e) { return String(e.dateStart || '').slice(0, 4); };
  var periode = function (e) { return annee(e) + (e.dateEnd && e.dateEnd !== e.dateStart ? ' – ' + e.dateEnd : ''); };
  var entree = {}; C.entrees.forEach(function (e) { entree[e.id] = e; });
  var ytImg = function (e) { var m = /[?&]v=([\w-]{6,})/.exec((e && e.video) || ''); return m ? 'https://i.ytimg.com/vi/' + m[1] + '/hqdefault.jpg' : ''; };
  var tete = function (s) { return String(s || '').split(' : ')[0]; };
  var liste = function (lignes) { return '<ul class="liste">' + lignes.map(function (l) { return '<li><span>' + esc(l[0]) + '</span><span>' + (l[2] ? '<a href="' + esc(l[2]) + '">' + fr(l[1]) + '</a>' : fr(l[1])) + '</span></li>'; }).join('') + '</ul>'; };
  var liens = function (ls) { return '<p class="liens">' + ls.map(function (l, i) { return '<a' + (i === 0 ? ' class="plein"' : '') + ' href="' + esc(l[1]) + '"' + (l[2] ? ' rel="noopener"' : '') + '>' + fr(l[0]) + '</a>'; }).join('') + '</p>'; };
  var chiffres = function (cs) { return '<ul class="chiffres-station">' + cs.map(function (c) { return '<li><b>' + esc(c[0]) + '</b><span>' + fr(c[1]) + '</span></li>'; }).join('') + '</ul>'; };
  var carte = function (o) {
    return '<div class="carte-station"><p class="surtitre">' + fr(o.sur) + '</p><h2 id="t-' + o.id + '">' + fr(o.titre) + '</h2>' + (o.date ? '<p class="date">' + fr(o.date) + '</p>' : '') +
      (o.texte ? '<p class="texte">' + fr(o.texte) + '</p>' : '') + (o.corps || '') + '</div>';
  };

  /* ---------- les stations, dans l’ordre du récit ---------- */
  var S = [];
  /* Saint-Luc : les archives et les années de formation */
  var clip = entree['e-clip-saint-luc'];
  S.push({ id: 'archives', face: 'arriere', dock: 'archives', motif: 'une', proj: { img: ytImg(clip), titre: 'Saint-Luc', sur: 'Archives · 1999 – 2005' },
    tuiles: [clip ? { b: periode(clip), s: clip.title, img: ytImg(clip), href: 'chronologie.html#' + clip.id } : null]
      .concat(C.archives.map(function (a) { return { b: String(a.originalDate || '').slice(0, 4), s: a.title + (a.attente ? ' · à déposer' : ''), attente: a.attente, href: 'chronologie.html#avant' }; }))
      .concat(['e-1999-comines', 'e-saint-luc-superieur'].map(function (id) { var e = entree[id]; return e ? { b: periode(e), s: e.title, href: 'chronologie.html#' + e.id } : null; })),
    carte: { sur: 'Saint-Luc, 1999 – 2005', titre: 'Archives', texte: 'Six années de formation, à Tournai. Le carré, le cube, la mosaïque, l’image en mouvement.',
      corps: liste(C.archives.map(function (a) { return [a.originalDate || 'à vérifier', a.title + (a.attente ? ' (à déposer)' : ''), 'chronologie.html#avant']; })) +
        liens([['Toutes les archives', 'chronologie.html#avant'], ['Le clip UPTOWN', 'chronologie.html#e-clip-saint-luc']]) } });

  /* 1999 – 2025 : la chronologie publiée, et ses preuves */
  var nb = function (s) { return C.entrees.filter(function (e) { return e.evidenceStatus === s; }).length; };
  S.push({ id: 'chronologie', face: 'avant', dock: 'chronologie', motif: 'neuf', proj: { img: (VIS.phare || {}).src, titre: '1999 – 2025', sur: 'Chronologie · avant l’inventaire' },
    tuiles: C.entrees.slice(0, 8).map(function (e) { return { b: annee(e), s: e.title, attente: e.evidenceStatus === 'a-verifier', href: 'chronologie.html#' + e.id }; })
      .concat([{ b: String(C.relations.length), s: 'relations justifiées', nacre: true, href: 'chronologie.html#avant' }]),
    carte: { sur: 'Explorer les recherches', titre: 'Chronologie', date: '1999 – 2025', texte: C.chapeau,
      corps: chiffres([[C.entrees.length, 'moments publiés'], [nb('declare'), 'déclarés par l’auteur'], [nb('a-verifier'), 'à vérifier, dits comme tels']]) +
        '<p class="texte">Chaque date a sa preuve : un document, une déclaration de l’auteur, ou « à vérifier ».</p>' +
        liens([['La chronologie', 'chronologie.html'], ['Du cube à la grille', 'chronologie.html#e-cube-grille']]) } });

  /* 2025 – 2026 : les époques, puis Demain */
  H.chapitres.filter(function (c) { return !c.projets; }).forEach(function (c) {
    var v = VIS[c.bandeau], m = c.moments || [];
    S.push({ id: 'epoque-' + c.id, face: 'avant', dock: 'chronologie', motif: 'une', proj: { img: v && v.src, titre: c.titre, sur: c.date },
      tuiles: [{ b: c.lieu, s: c.date, img: v && v.src, href: 'chronologie.html#' + c.id, grande: true }]
        .concat(m.slice(0, 5).map(function (x) { return { b: x.quand, s: x.titre, href: 'chronologie.html#' + c.id }; })),
      carte: { sur: 'Époque · ' + c.lieu, titre: c.titre, date: c.date, texte: c.chapeau,
        corps: liste(m.map(function (x) { return [x.quand, x.titre, 'chronologie.html#' + c.id]; })) + liens([['Lire l’époque', 'chronologie.html#' + c.id]]) } });
  });
  var D = H.demain;
  if (D) S.push({ id: 'epoque-demain', face: 'avant', dock: 'chronologie', motif: 'une', proj: { img: (VIS[D.bandeau] || {}).src, titre: D.titre, sur: D.date },
    tuiles: [{ b: D.titre, s: D.date, img: (VIS[D.bandeau] || {}).src, href: 'chronologie.html#demain', grande: true }]
      .concat((D.etapes || []).slice(0, 5).map(function (e, i) { return { b: String(i + 1), s: e[0], attente: true, href: 'chronologie.html#demain' }; })),
    carte: { sur: 'La suite', titre: D.titre, date: D.date, texte: D.chapeau,
      corps: '<span class="propose">Proposé, pas encore engagé</span>' + liste((D.etapes || []).map(function (e, i) { return [String(i + 1), e[0], 'chronologie.html#demain']; })) +
        liens([['La feuille de route', 'chronologie.html#demain']]) } });

  /* la Composition : une case par famille, ses applications comptées */
  var parFamille = {}; A.applications.forEach(function (a) { parFamille[a[2]] = (parFamille[a[2]] || 0) + 1; });
  S.push({ id: 'composition', face: 'droite', dock: 'composition', motif: 'seize', proj: { img: (VIS['grille-roses'] || {}).src, titre: 'Composition', sur: 'Créer avec les blocs' },
    tuiles: A.familles.map(function (f) { var v = VFAM[f.id]; return { b: String(parFamille[f.id] || 0), s: f.nom, img: v && v.src, teinte: v ? '' : B.teinte(f.id), href: 'composition.html#atelier' }; }),
    carte: { sur: 'Créer avec les blocs', titre: 'Composition', texte: 'Un fragment : une idée, une application, une archive. Un bloc : les fragments d’une même famille. Une composition : les blocs reliés, sur la grille.',
      corps: chiffres([[A.applications.length, 'applications Base44'], [A.familles.length, 'familles, une case chacune'], [A.achevement.briques.length, 'briques sur la grille']]) +
        liens([['La grille', 'composition.html'], ['Le +', 'composition.html#plus'], ['Le Cube de Saint-Luc (maquette)', 'cube.html']]) } });

  /* les Relations : celles que la chronologie justifie, et les trois formes */
  var NATURE = { devenu: 'devenu', eclaire: 'éclaire', suite: 'suite' };
  S.push({ id: 'relations', face: 'gauche', dock: 'relations', motif: 'neuf', proj: { img: (VIS.fils || {}).src, titre: 'Relations', sur: 'Du cube à la grille' },
    tuiles: C.relations.slice(0, 6).map(function (r) { return { b: NATURE[r.nature] || r.nature, s: tete(r.justification), href: 'chronologie.html#' + r.de }; })
      .concat([{ b: '□', s: 'Le carré · ATLAS', href: 'composition.html' }, { b: '○', s: 'Le cercle · .0NE', href: 'https://preview.lemondeaime.com/studio/one/univers' }, { b: '·', s: 'Le Point · AIME', nacre: true, href: 'chronologie.html#e-cube-grille' }]),
    carte: { sur: 'Du cube à la grille', titre: 'Relations', texte: 'Les archives racontent. Les fragments composent. Les relations transforment. La grille rassemble.',
      corps: liste(C.relations.map(function (r) { return [NATURE[r.nature] || r.nature, tete(r.justification), 'chronologie.html#' + r.de]; })) +
        '<blockquote>« Pendant vingt-cinq ans, j’ai créé des fragments. Aujourd’hui, j’ai trouvé comment les relier. »</blockquote>' +
        liens([['Entrer dans le Cube', 'vue-cube.html'], ['Le carré · la grille', 'composition.html'], ['Le cercle · .0NE ↗', 'https://preview.lemondeaime.com/studio/one/univers', 1]]) } });

  /* les Modules : neuf, une case chacun */
  S.push({ id: 'modules', face: 'haut', dock: 'modules', motif: 'neuf', proj: { img: (VIS.saxophoniste || {}).src, titre: 'Modules', sur: 'Timeline, Agenda, Facture…' },
    tuiles: A.modules.slice(0, 9).map(function (m) { return { b: m.titre, s: m.capacites.length ? m.capacites.length + ' capacité' + (m.capacites.length > 1 ? 's' : '') : 'noms répétés', mot: true, href: 'composition.html#atelier' }; }),
    carte: { sur: 'Timeline, Agenda, Facture…', titre: 'Modules', texte: 'Les fonctionnalités recréées le plus souvent, devenues des blocs vivants. Reliés, ils partagent ce qu’ils savent : les moments de la Timeline paraissent dans l’Agenda, un montant part à la Facture.',
      corps: liste(A.modules.map(function (m) { return [m.titre, m.capacites.length ? m.capacites.join(', ') : 'Né des noms répétés']; })) + liens([['Les modules dans la grille', 'composition.html#atelier'], ['Le moteur', 'moteur.html']]) } });

  /* l’Écosystème : les projets, comptés par état déclaré */
  var etats = {}; A.projets.forEach(function (p) { etats[p.etat] = (etats[p.etat] || 0) + 1; });
  var ET = Object.keys(etats);
  S.push({ id: 'projets', face: 'bas', dock: 'projets', motif: 'une', proj: { img: (VIS.sculpture || {}).src, titre: 'Écosystème', sur: 'Les projets et leur état' },
    tuiles: [{ b: String(A.projets.length), s: 'projets dans l’écosystème', nacre: true, grande: true, href: 'ecosysteme.html' }]
      .concat(ET.map(function (k) { return { b: String(etats[k]), s: k, href: 'ecosysteme.html' }; })),
    carte: { sur: 'Les projets et leur état', titre: 'Écosystème', texte: 'Chaque projet garde l’état déclaré dans sa fiche.',
      corps: chiffres([[A.projets.length, 'projets']].concat(ET.slice(0, 2).map(function (k) { return [etats[k], k.toLowerCase()]; }))) +
        liste(A.projets.slice(0, 8).map(function (p) { return [p.etat, p.titre, 'ecosysteme.html']; })) + liens([['Tous les projets', 'ecosysteme.html']]) } });

  /* la fin : le Cube se déplie */
  S.push({ id: 'deplie', deplie: true, dock: 'grille', proj: { titre: 'La grille', sur: 'Le Cube, déplié' },
    carte: { sur: 'Le Cube, déplié', titre: 'Six faces, une grille', texte: 'Déplié, le Cube devient son patron : la Chronologie au centre, la Composition et les Archives à sa droite, les Relations à sa gauche, les Modules au-dessus, l’Écosystème dessous. Posées à plat, ses cases deviennent des blocs.',
      corps: liens([['Descendre vers la grille', '#grille']]) } });

  /* ---------- le récit : une section par station ---------- */
  var fil = document.getElementById('recit');
  S.forEach(function (s, i) {
    s.cote = s.deplie ? 'gauche' : i % 2 ? 'droite' : 'gauche';
    var sec = document.createElement('section');
    sec.className = 'station'; sec.id = s.id; sec.setAttribute('data-cote', s.cote); sec.setAttribute('aria-labelledby', 't-' + s.id);
    s.carte.id = s.id; sec.innerHTML = carte(s.carte); fil.appendChild(sec); s.el = sec;
    s.tuiles = (s.tuiles || []).filter(Boolean);
  });
  S.unshift({ id: 'intro', intro: true, el: document.getElementById('haut-de-page'), dock: '' });

  /* ---------- le Cube ---------- */
  var scene = document.getElementById('scene'), cs = document.getElementById('cube-scene'), cube = document.getElementById('le-cube');
  var loupe = document.getElementById('loupe'), fond = document.getElementById('titre-plan'), sous = document.getElementById('intro-sous');
  var legende = document.getElementById('cube-legende'), patron = document.getElementById('patron'), projection = document.getElementById('projection');
  cube.innerHTML = '<span class="coeur-point" aria-hidden="true"></span>' + Object.keys(ORIENT).map(function (f) {
    return '<div class="face face-' + f + '" data-face="' + f + '"><div class="cases"></div></div>';
  }).join('');
  var PLACE = { haut: [2, 1], gauche: [1, 2], avant: [2, 2], droite: [3, 2], arriere: [4, 2], bas: [2, 3] };
  patron.innerHTML = Object.keys(PLACE).map(function (f) { return '<i data-face="' + f + '" style="grid-column:' + PLACE[f][0] + ';grid-row:' + PLACE[f][1] + '"></i>'; }).join('');

  function tuile(t, c, i) {
    var cls = 'tuile' + (t.img ? ' image' : '') + (t.nacre ? ' nacre' : '') + (t.attente ? ' attente' : '') + (t.grande || c[2] > 1 ? ' grande' : '');
    var ext = /^https?:/.test(t.href || '');
    return '<a class="' + cls + '" href="' + esc(t.href || '#') + '"' + (ext ? ' rel="noopener"' : '') + ' tabindex="-1" draggable="false" style="grid-column:' + (c[0] + 1) + ' / span ' + c[2] + ';grid-row:' + (c[1] + 1) + ' / span ' + c[3] + ';--i:' + i + '">' +
      (t.img ? '<img src="' + esc(t.img) + '" alt="" loading="lazy" draggable="false" onerror="this.parentNode.classList.remove(\'image\');this.remove()">' : '') +
      (t.teinte ? '<span class="pastille" style="background:' + t.teinte + '"></span>' : '') +
      '<b' + (t.mot ? ' style="font-size:1.25em"' : '') + '>' + esc(t.b) + '</b>' + (t.s ? '<small>' + esc(t.s) + '</small>' : '') + '</a>';
  }
  var surFace = {};
  function remplir(s, anime) {
    var face = cube.querySelector('.face-' + s.face), m = MOTIFS[s.motif], cases = face.querySelector('.cases');
    cases.style.setProperty('--n', m.n);
    cases.innerHTML = m.cases.map(function (c, i) { var t = s.tuiles[i]; return t ? tuile(t, c, i) : '<span class="tuile vide" style="grid-column:' + (c[0] + 1) + ' / span ' + c[2] + ';grid-row:' + (c[1] + 1) + ' / span ' + c[3] + '"></span>'; }).join('');
    surFace[s.face] = s.id;
    if (anime && !calme) { face.classList.remove('change'); void face.offsetWidth; face.classList.add('change'); }
  }
  /* au départ, chaque face porte sa première station */
  S.forEach(function (s) { if (s.face && !surFace[s.face]) remplir(s, false); });

  /* la projection : une couche par station, créée à la première visite */
  function projeter(s) {
    var p = s.proj; Array.prototype.forEach.call(projection.children, function (el) { el.classList.toggle('active', el.getAttribute('data-station') === s.id); });
    if (!p || projection.querySelector('[data-station="' + s.id + '"]')) return;
    var el = document.createElement('div'); el.className = 'proj'; el.setAttribute('data-station', s.id);
    el.innerHTML = (p.img ? '<img src="' + esc(p.img) + '" alt="" onerror="this.remove()">' : '') + '<p class="proj-sur">' + fr(p.sur || '') + '</p><p class="proj-titre">' + fr(p.titre) + '</p>';
    projection.appendChild(el); void el.offsetWidth; el.classList.add('active');
  }

  /* ---------- l’orientation de chaque station : sa face, vue de trois quarts, en balançant d’une station à l’autre ---------- */
  var O = [], prec = 32;
  S.forEach(function (s, i) {
    if (s.intro) { O.push({ rx: -18, ry: 32, s: .82, tx: 0 }); return; }
    if (s.deplie) { var r0 = 360 * Math.round(prec / 360); O.push({ rx: 0, ry: r0, s: 0, tx: 0, deplie: true }); prec = r0; return; }
    var b = ORIENT[s.face], cote = i % 2 ? 1 : -1, ry = b[1] + 20 * cote, rx = (b[0] || 0) + (b[0] ? 12 * cote : -14);
    ry += 360 * Math.round((prec - ry) / 360); prec = ry; O.push({ rx: rx, ry: ry, s: 1, tx: 0 });
  });

  /* ---------- le défilement mène le Cube ---------- */
  var centres = [], plateau = document.getElementById('grille');
  var c = 300, vw = innerWidth, vh = innerHeight;
  function mesurer() {
    vw = innerWidth; vh = innerHeight; c = cs.offsetWidth;
    document.documentElement.style.setProperty('--c-moitie', (c / 2) + 'px');
    centres = S.map(function (s) { var r = s.el.getBoundingClientRect(); return r.top + scrollY + (s.intro ? vh / 2 : r.height / 2); });
    /* déplié, la croix tient dans la place que laisse la carte (à gauche sur grand écran) */
    var carteD = document.querySelector('#deplie .carte-station'), libre = vw, tx = 0;
    if (vw > 960 && carteD) { libre = vw - carteD.getBoundingClientRect().right - 24; tx = vw / 2 - libre / 2; }
    var sd = Math.min(1, libre * 0.92 / (4.1 * c), vh * 0.62 / (3.1 * c));
    O.forEach(function (o) { if (o.deplie) { o.s = sd; o.tx = tx; } });
    /* au début, le Cube laisse dépasser « MATT MEZ » : plus petit sur téléphone */
    O[0].s = vw > 960 ? .82 : .64;
  }
  var lisse = function (x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  var drx = 0, dry = 0, glisse = null, active = -1, rx = -18, ry = 32;

  function etat(t) {
    var v = scrollY + vh / 2, i = 0;
    while (i < centres.length - 1 && centres[i + 1] <= v) i++;
    var j = Math.min(i + 1, O.length - 1), p = j === i ? 0 : (v - centres[i]) / (centres[j] - centres[i]);
    var q = calme ? (p < .5 ? 0 : 1) : lisse((p - .22) / .56);
    var a = O[i], b = O[j];
    var ax = a.rx, ay = a.ry;
    if (i === 0 && !calme) { ax += 5 * Math.sin(t / 3100); ay += 24 * Math.sin(t / 5200); }
    return { i: q < .5 ? i : j, rx: ax + (b.rx - ax) * q, ry: ay + (b.ry - ay) * q, s: a.s + (b.s - a.s) * q, tx: a.tx + (b.tx - a.tx) * q };
  }

  /* la face qui regarde l’écran */
  var rad = function (d) { return d * Math.PI / 180; };
  function tourner(p, x, y) {
    var a = rad(x), b = rad(y);
    var x1 = p[0] * Math.cos(b) + p[2] * Math.sin(b), z1 = -p[0] * Math.sin(b) + p[2] * Math.cos(b);
    return [x1, p[1] * Math.cos(a) - z1 * Math.sin(a), p[1] * Math.sin(a) + z1 * Math.cos(a)];
  }
  var NORMALES = { avant: [0, 0, 1], droite: [1, 0, 0], arriere: [0, 0, -1], gauche: [-1, 0, 0], haut: [0, -1, 0], bas: [0, 1, 0] };
  function enFace(x, y) { var m = null, z = -2; Object.keys(NORMALES).forEach(function (k) { var w = tourner(NORMALES[k], x, y)[2]; if (w > z) { z = w; m = k; } }); return m; }

  /* la loupe : l’enveloppe convexe des huit sommets projetés */
  function enveloppe(pts) {
    pts.sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; });
    var croix = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }, bas = [], haut = [];
    pts.forEach(function (p) { while (bas.length > 1 && croix(bas[bas.length - 2], bas[bas.length - 1], p) <= 0) bas.pop(); bas.push(p); });
    pts.slice().reverse().forEach(function (p) { while (haut.length > 1 && croix(haut[haut.length - 2], haut[haut.length - 1], p) <= 0) haut.pop(); haut.push(p); });
    return bas.slice(0, -1).concat(haut.slice(0, -1));
  }
  function poserLoupe(x, y, sc) {
    var h = c / 2 * sc, per = c * 3.6, cx = cs.offsetLeft + c / 2, cy = cs.offsetTop + c / 2, pts = [];
    [-1, 1].forEach(function (i) { [-1, 1].forEach(function (j) { [-1, 1].forEach(function (k) {
      var p = tourner([i * h, j * h, k * h], x, y), f = per / (per - p[2]); pts.push([cx + p[0] * f, cy + p[1] * f]);
    }); }); });
    var e = enveloppe(pts).map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; });
    loupe.style.clipPath = 'polygon(' + e.join(',') + ')';
    fond.style.clipPath = 'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ' + e.join(',') + ', ' + e[0] + ')';
  }

  var lieux = Array.prototype.slice.call(document.querySelectorAll('#dock .lieu'));
  function activer(k) {
    var s = S[k]; active = k;
    S.forEach(function (x, n) { x.el.classList.toggle('active', n === k); });
    if (s.face && surFace[s.face] !== s.id) remplir(s, true);
    cube.classList.toggle('deplie', !!s.deplie);
    projeter(s);
    var f = s.face ? '<b>' + esc(MOT[s.face]) + '</b> · ' : '';
    legende.innerHTML = s.intro ? '' : s.deplie ? '<b>Le Cube déplié</b> · six faces, une grille' : f + fr(s.carte.titre);
  }
  function dock(v) {
    var cible = plateau.getBoundingClientRect().top < vh * .5 ? 'grille' : (S[active] && S[active].dock) || '';
    lieux.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + cible)); });
  }

  var vu = '';
  function image(t) {
    var e = etat(t);
    if (e.i !== active) activer(e.i);
    if (!glisse) { drx *= .9; dry *= .9; }
    rx = e.rx + drx; ry = e.ry + dry;
    var cle = rx.toFixed(2) + ',' + ry.toFixed(2) + ',' + e.s.toFixed(3) + ',' + e.tx.toFixed(1) + ',' + scrollY;
    if (cle !== vu) {
      vu = cle;
      cube.style.transform = 'translateX(' + e.tx.toFixed(1) + 'px) scale(' + e.s.toFixed(3) + ') rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      var k = Math.max(0, Math.min(1, scrollY / (vh * .55)));
      fond.style.opacity = loupe.style.opacity = sous.style.opacity = String(1 - k);
      legende.style.opacity = String(k);
      if (k < 1) poserLoupe(rx, ry, e.s);
      var f = S[active].deplie ? '' : enFace(rx, ry);
      Array.prototype.forEach.call(cube.children, function (el) { if (el.classList.contains('face')) el.classList.toggle('face-visible', el.getAttribute('data-face') === f); });
      Array.prototype.forEach.call(patron.children, function (el) { el.classList.toggle('actif', S[active].deplie || el.getAttribute('data-face') === f); });
      dock();
    }
    requestAnimationFrame(image);
  }

  /* ---------- saisir le Cube : il tourne sous le doigt, puis revient à la place que le récit lui donne ---------- */
  scene.addEventListener('dragstart', function (e) { e.preventDefault(); });
  scene.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    glisse = { x: e.clientX, y: e.clientY, bouge: 0, id: e.pointerId };
  });
  scene.addEventListener('pointermove', function (e) {
    if (!glisse || e.pointerId !== glisse.id) return;
    var dx = e.clientX - glisse.x, dy = e.clientY - glisse.y;
    glisse.bouge += Math.abs(dx) + Math.abs(dy);
    if (!glisse.capte && glisse.bouge > 6) { glisse.capte = true; try { scene.setPointerCapture(e.pointerId); } catch (er) { /* rien */ } scene.classList.add('glisse'); }
    if (!glisse.capte) return;
    dry += dx * .45; drx = Math.max(-80, Math.min(80, drx - dy * .45));
    glisse.x = e.clientX; glisse.y = e.clientY;
  });
  function lacher() { if (!glisse) return; scene.dataset.glisse = glisse.bouge > 6 ? '1' : ''; glisse = null; scene.classList.remove('glisse'); }
  scene.addEventListener('pointerup', lacher);
  scene.addEventListener('pointercancel', lacher);
  /* après un glisser, une tuile ne s’ouvre pas */
  scene.addEventListener('click', function (e) { if (scene.dataset.glisse) { e.preventDefault(); scene.dataset.glisse = ''; } }, true);
  cs.addEventListener('keydown', function (e) {
    var pas = { ArrowRight: [0, 40], ArrowLeft: [0, -40], ArrowUp: [-30, 0], ArrowDown: [30, 0] }[e.key];
    if (pas) { e.preventDefault(); drx += pas[0]; dry += pas[1]; }
  });

  /* ---------- la grille des blocs : la composition proposée par l’achèvement ---------- */
  var g = document.getElementById('recit-grille'), Ach = A.achevement;
  document.getElementById('grille-principe').innerHTML = fr(Ach.principe);
  g.innerHTML = Ach.briques.map(function (b) {
    var v = VFAM[b.famille];
    return '<a class="bloc brique ' + esc(b.style) + '" href="composition.html#atelier" style="grid-column:' + (b.x + 1) + ' / span ' + b.w + ';grid-row:' + (b.y + 1) + ' / span ' + b.h + '">' +
      (b.style === 'photo' && v ? '<img class="fond-bloc" src="' + esc(v.src) + '" alt="" loading="lazy">' : '') + B.brique(b, 1) + '</a>';
  }).join('');

  mesurer();
  addEventListener('resize', mesurer);
  addEventListener('load', mesurer);
  activer(0);
  if (location.hash && document.getElementById(location.hash.slice(1))) document.getElementById(location.hash.slice(1)).scrollIntoView();
  requestAnimationFrame(image);
})();
