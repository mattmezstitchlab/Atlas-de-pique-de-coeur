/* Le Cube de Saint-Luc (maquette fonctionnelle) : cinq faces en grilles mosaïques, une face ouverte, la chronologie à l’intérieur.
   Une seule mémoire de fragments : chaque fragment est posé au plus une fois, sur une seule case d’une seule face.
   La rotation ne touche jamais aux données : elle ne change que la vue. Seuls les gestes explicites (poser, retirer, déplacer)
   modifient la disposition, gardée sur cet appareil (localStorage « atlas-cube-v1 »). */
(function () {
  var A = window.ATLAS, C = A.cube, N = C.cotes, CLE = 'atlas-cube-v1';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fr = function (s) { return esc(s).replace(/ ([:;?!»])/g, '&nbsp;$1').replace(/« /g, '«&nbsp;'); };
  var calme = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- la mémoire : tous les fragments, tirés des vraies données (jamais copiés, jamais inventés) ---------- */
  var FRAG = [], PAR_ID = {};
  function ajouter(f) { FRAG.push(f); PAR_ID[f.id] = f; }
  (A.chronologie ? A.chronologie.entrees : []).forEach(function (e) { ajouter({ id: 'moment:' + e.id, type: 'moment', titre: e.title, sous: (e.dateStart || '') + (e.dateEnd ? ' – ' + e.dateEnd : ''), href: 'chronologie.html#' + e.id }); });
  (A.achevement ? A.achevement.briques : []).forEach(function (b) { ajouter({ id: 'brique:' + b.id, type: 'brique', titre: b.titre, sous: 'Tentée ' + b.tentatives + ' fois', style: b.style, href: 'composition.html' }); });
  (A.modules || []).forEach(function (m) { ajouter({ id: 'module:' + m.id, type: 'module', titre: m.titre, sous: 'Module', href: 'composition.html#atelier' }); });
  (A.visuels || []).forEach(function (v) { ajouter({ id: 'visuel:' + v.id, type: 'visuel', titre: v.legende, sous: v.accroche, src: v.src, alt: v.alt, href: 'composition.html' }); });
  var TYPES = { moment: 'Moments', brique: 'Briques', module: 'Modules', visuel: 'Visuels' };

  /* ---------- la disposition : face → case → fragment ; une fois au plus par fragment ---------- */
  var FACES = C.faces, FID = {}; FACES.forEach(function (f) { FID[f.id] = f; });
  var dispo;
  function semer() {
    var d = {}; FACES.forEach(function (f) { d[f.id] = {}; });
    FACES.forEach(function (f) {
      var k = 0;
      (C.semis[f.id] || []).forEach(function (motif) {
        FRAG.forEach(function (x) { if (k >= N * N) return; var ok = motif.indexOf(':') !== -1 ? x.id === motif : x.type === motif; if (ok && !ou(d, x.id)) { d[f.id][k] = x.id; k += motif === 'visuel' ? 2 : 1; } });
      });
    });
    return d;
  }
  function ou(d, id) { for (var f in d) for (var c in d[f]) if (d[f][c] === id) return { face: f, cell: +c }; return null; }
  /* l’invariant : chaque fragment existe, et n’est posé qu’une fois ; tout le reste est écarté au chargement */
  function valide(d) {
    var vu = {}, propre = {}; FACES.forEach(function (f) { propre[f.id] = {}; var src = (d && d[f.id]) || {};
      Object.keys(src).forEach(function (c) { var id = src[c], i = +c; if (PAR_ID[id] && !vu[id] && i >= 0 && i < N * N) { vu[id] = 1; propre[f.id][i] = id; } }); });
    return propre;
  }
  try { dispo = JSON.parse(localStorage.getItem(CLE) || 'null'); dispo = dispo && dispo.dispo ? valide(dispo.dispo) : null; } catch (e) { dispo = null; }
  if (!dispo) dispo = semer();
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify({ version: 1, dispo: dispo })); } catch (e) { /* la composition vit pour la séance */ } }
  var poses = function () { var n = 0; FACES.forEach(function (f) { n += Object.keys(dispo[f.id]).length; }); return n; };

  /* ---------- le Cube en 3D ---------- */
  var scene = document.getElementById('cube-scene'), cube = document.getElementById('cube'), etat = document.getElementById('cube-etat');
  var ORIENT = { avant: [0, 0], droite: [0, -90], arriere: [0, -180], gauche: [0, -270], haut: [-90, 0], bas: [90, 0] };
  function caseHTML(f, i, petit) {
    var id = dispo[f.id][i], x = id && PAR_ID[id];
    if (!x) return '<i class="cs-case"></i>';
    return '<i class="cs-case pleine t-' + x.type + (x.style ? ' s-' + esc(x.style) : '') + '"' + (x.src ? ' style="background-image:url(' + esc(x.src) + ')"' : '') + (petit ? '' : ' title="' + esc(x.titre) + '"') + '></i>';
  }
  function dessinerCube() {
    var html = FACES.map(function (f) {
      var cells = ''; for (var i = 0; i < N * N; i++) cells += caseHTML(f, i, true);
      return '<button type="button" class="cs-face pos-' + f.position + '" data-face="' + f.id + '" tabindex="-1" aria-hidden="true"><span class="cs-grille" style="--n:' + N + '">' + cells + '</span><span class="cs-nom"><b>' + esc(f.nom) + '</b><small>' + esc(f.verbe) + '</small></span></button>';
    }).join('');
    /* la face ouverte : seulement son cadre ; l’intérieur se voit à travers */
    var o = C.ouverture;
    html += '<div class="cs-ouverture pos-' + o.position + '" aria-hidden="true"><span class="cs-nom"><b>' + esc(o.nom) + '</b><small>' + esc(o.verbe) + '</small></span></div>';
    /* l’intérieur : les années en plans successifs, du plus ancien (au fond) au plus récent (près de l’ouverture) */
    html += '<div class="cs-interieur" aria-hidden="true">' + couches(true).map(function (c, k, t) {
      var z = -0.45 + (k / Math.max(1, t.length - 1)) * 0.82;
      return '<a class="cs-couche" href="' + esc(c.href) + '" tabindex="-1" style="--z:' + z.toFixed(3) + '"><b>' + esc(c.annee) + '</b><span>' + esc(c.titre) + '</span></a>';
    }).join('') + '</div>';
    cube.innerHTML = html;
  }
  /* les couches du temps : la chronologie publiée (1999 – 2025) puis les époques 2025 – 2026 */
  function couches(court) {
    var L = [];
    (A.chronologie ? A.chronologie.entrees : []).forEach(function (e) { if (e.publicationStatus === 'publie') L.push({ annee: (e.dateStart || '').slice(0, 4) + (e.dateEnd && e.dateEnd.slice(0, 4) !== e.dateStart.slice(0, 4) ? '–' + e.dateEnd.slice(2, 4) : ''), titre: e.title, href: 'chronologie.html#' + e.id }); });
    if (court) { L.push({ annee: '2025–26', titre: 'L’inventaire et l’écosystème', href: 'chronologie.html#novembre' }); return L; }
    (A.histoire ? A.histoire.chapitres : []).forEach(function (c) { L.push({ annee: c.lieu, titre: c.titre, href: 'chronologie.html#' + c.id }); });
    return L;
  }

  /* orientation : la vue seulement */
  var rx = -16, ry = 28, vx = 0, vy = 0, glisse = null, raf = 0, dernier = 0, auto = !calme;
  function poser() { cube.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)'; legender(); }
  var NORM = { avant: [0, 0, 1], droite: [1, 0, 0], arriere: [0, 0, -1], gauche: [-1, 0, 0], haut: [0, -1, 0], bas: [0, 1, 0] };
  function faceVue() {
    var a = rx * Math.PI / 180, b = ry * Math.PI / 180, best = null, s = -2;
    Object.keys(NORM).forEach(function (k) { var n = NORM[k], z1 = -n[0] * Math.sin(b) + n[2] * Math.cos(b), z2 = n[1] * Math.sin(a) + z1 * Math.cos(a); if (z2 > s) { s = z2; best = k; } });
    return best;
  }
  var vue = null;
  function legender() {
    var p = faceVue(); if (p === vue) return; vue = p;
    var f = FACES.filter(function (x) { return x.position === p; })[0] || C.ouverture;
    etat.innerHTML = '<b>' + esc(f.nom) + '</b> · ' + esc(f.verbe) + (f === C.ouverture ? ' — la face ouverte : Entrée pour regarder à l’intérieur' : ' — Entrée pour agrandir sa grille');
    Array.prototype.forEach.call(cube.querySelectorAll('.cs-face, .cs-ouverture'), function (el) { el.classList.toggle('vue', el.classList.contains('pos-' + p)); });
  }
  function boucle(t) { var dt = Math.min(48, t - (dernier || t)); dernier = t;
    if (!glisse) { if (Math.abs(vx) + Math.abs(vy) > 0.01) { ry += vy * dt; rx += vx * dt; vx *= .94; vy *= .94; } else if (auto) ry += .005 * dt; rx = Math.max(-85, Math.min(85, rx)); poser(); }
    raf = requestAnimationFrame(boucle); }
  function tourner(cible, apres) {
    auto = false; vx = vy = 0; cancelAnimationFrame(raf);
    var c = { rx: cible[0], ry: cible[1] + 360 * Math.round((ry - cible[1]) / 360) }, d0 = { rx: rx, ry: ry }, t0 = performance.now(), d = calme ? 1 : 520;
    (function pas(t) { var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); rx = d0.rx + (c.rx - d0.rx) * e; ry = d0.ry + (c.ry - d0.ry) * e; poser();
      if (k < 1) requestAnimationFrame(pas); else { dernier = 0; raf = requestAnimationFrame(boucle); if (apres) apres(); } })(t0);
  }
  scene.addEventListener('pointerdown', function (e) { if (e.button !== undefined && e.button !== 0) return; if (scene.classList.contains('dedans')) return; glisse = { x: e.clientX, y: e.clientY, t: performance.now(), d: 0 }; auto = false; vx = vy = 0; try { scene.setPointerCapture(e.pointerId); } catch (er) { /* rien */ } });
  scene.addEventListener('pointermove', function (e) { if (!glisse) return; var dx = e.clientX - glisse.x, dy = e.clientY - glisse.y, t = performance.now(), dt = Math.max(1, t - glisse.t); glisse.d += Math.abs(dx) + Math.abs(dy);
    ry += dx * .45; rx -= dy * .45; rx = Math.max(-85, Math.min(85, rx)); vy = dx * .45 / dt; vx = -dy * .45 / dt; glisse.x = e.clientX; glisse.y = e.clientY; glisse.t = t; poser(); });
  function lacher(e) {
    if (!glisse) return; var g = glisse; glisse = null; dernier = 0;
    if (g.d < 6) { /* un toucher : la face touchée s’ouvre (ou l’intérieur, pour la face ouverte) */
      var el = document.elementFromPoint(e.clientX, e.clientY), f = el && el.closest('[data-face]');
      if (f) agrandir(f.getAttribute('data-face')); else if (el && el.closest('.cs-ouverture, .cs-interieur')) entrer();
    }
  }
  scene.addEventListener('pointerup', lacher);
  scene.addEventListener('pointercancel', function () { glisse = null; });
  scene.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); var f = FACES.filter(function (x) { return x.position === vue; })[0]; if (f) agrandir(f.id); else entrer(); return; }
    var pas = { ArrowRight: [0, -90], ArrowLeft: [0, 90], ArrowUp: [-90, 0], ArrowDown: [90, 0] }[e.key]; if (!pas) return;
    e.preventDefault(); var cx = Math.max(-90, Math.min(90, Math.round(rx / 90) * 90 + pas[0])), cy = Math.round(ry / 90) * 90 + pas[1]; if (Math.abs(cx) === 90 && pas[1]) cx = 0; tourner([cx, cy]);
  });

  /* ---------- regarder à l’intérieur ---------- */
  var dedans = document.getElementById('dedans');
  function entrer() {
    tourner(ORIENT.avant, function () {
      scene.classList.add('dedans'); document.body.classList.add('regard-dedans');
      dedans.hidden = false; dedans.querySelector('h2').focus();
    });
  }
  function sortir() { scene.classList.remove('dedans'); document.body.classList.remove('regard-dedans'); dedans.hidden = true; scene.focus(); auto = false; }
  document.getElementById('dedans-liste').innerHTML = couches().map(function (c) { return '<li><a href="' + esc(c.href) + '"><b>' + esc(c.annee) + '</b><span>' + fr(c.titre) + '</span></a></li>'; }).join('');
  document.getElementById('sortir').addEventListener('click', sortir);
  Array.prototype.forEach.call(document.querySelectorAll('[data-entrer]'), function (b) { b.addEventListener('click', entrer); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dedans.hidden) sortir(); });

  /* ---------- agrandir une grille : poser, retirer, déplacer les fragments ---------- */
  var atelier = document.getElementById('atelier-face'), choisi = null, faceOuverte = null, filtre = '';
  function agrandir(id) {
    var f = FID[id]; if (!f) return;
    tourner(ORIENT[f.position]);
    faceOuverte = f; choisi = null; rendreAtelier();
    if (typeof atelier.showModal === 'function') { if (!atelier.open) atelier.showModal(); } else atelier.setAttribute('open', '');
    var t = atelier.querySelector('.af-titre'); if (t) t.focus();
  }
  function rendreAtelier() {
    var f = faceOuverte, cells = '';
    for (var i = 0; i < N * N; i++) {
      var id = dispo[f.id][i], x = id && PAR_ID[id];
      cells += '<button type="button" class="af-case' + (x ? ' pleine t-' + x.type + (x.style ? ' s-' + esc(x.style) : '') : '') + (choisi && choisi.cell === i && choisi.face === f.id ? ' choisie' : '') + '" data-cell="' + i + '"' + (x && x.src ? ' style="background-image:url(' + esc(x.src) + ')"' : '') +
        ' aria-label="Case ' + (Math.floor(i / N) + 1) + '-' + (i % N + 1) + (x ? ' : ' + esc(x.titre) : ', vide') + '">' + (x ? '<span>' + fr(x.titre) + '</span>' : '') + '</button>';
    }
    var lien = f.lien ? '<a class="bouton" href="' + esc(f.lien.href) + '"' + (f.lien.externe ? ' rel="noopener"' : '') + '>' + fr(f.lien.titre) + (f.lien.externe ? '&nbsp;↗' : '') + '</a>' : '<span class="a-raccorder">Espace à raccorder : aucune page n’existe encore pour cette face.</span>';
    var tri = FRAG.filter(function (x) { return !filtre || x.type === filtre; });
    atelier.querySelector('.af-corps').innerHTML =
      '<header class="af-tete"><p class="surtitre">Face ' + esc(f.nom) + ' · ' + esc(f.verbe) + '</p><h2 class="af-titre" tabindex="-1">' + esc(f.nom) + '</h2><p class="af-role">' + fr(f.role) + '</p><p class="af-lien">' + lien + '</p></header>' +
      '<div class="af-plan"><div class="af-grille" style="--n:' + N + '" role="group" aria-label="La grille de la face ' + esc(f.nom) + '">' + cells + '</div>' +
      '<aside class="af-memoire" aria-label="La mémoire des fragments"><p class="af-aide" role="status" aria-live="polite">' + aide() + '</p>' +
      '<div class="af-filtres" role="group" aria-label="Filtrer la mémoire">' + [['', 'Tous']].concat(Object.keys(TYPES).map(function (k) { return [k, TYPES[k]]; })).map(function (t) { return '<button type="button" class="opt" data-filtre="' + t[0] + '" aria-pressed="' + (filtre === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<ul class="af-liste">' + tri.map(function (x) {
        var o = ou(dispo, x.id), sel = choisi && choisi.frag === x.id;
        return '<li><button type="button" class="af-frag t-' + x.type + (sel ? ' choisi' : '') + '" data-frag="' + esc(x.id) + '" aria-pressed="' + !!sel + '"><b>' + fr(x.titre) + '</b><small>' + esc(TYPES[x.type].replace(/s$/, '')) + (o ? ' · sur ' + esc(FID[o.face].nom) : ' · dans la mémoire') + '</small></button></li>';
      }).join('') + '</ul></aside></div>' +
      '<p class="af-compte">' + poses() + ' fragments posés sur ' + FRAG.length + ', une seule fois chacun.</p>';
  }
  function aide() {
    if (!choisi) return 'Choisissez un fragment dans la mémoire, ou une case pleine de la grille.';
    if (choisi.frag && choisi.cell == null) { var o = ou(dispo, choisi.frag); return '« ' + PAR_ID[choisi.frag].titre + ' » : touchez une case pour le poser' + (o ? ' (il quittera ' + FID[o.face].nom + ')' : '') + '.'; }
    return '« ' + PAR_ID[choisi.frag].titre + ' » : touchez une autre case pour le déplacer, ou <button type="button" class="lien-retirer" data-retirer>rendez-le à la mémoire</button>.';
  }
  atelier.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var f = faceOuverte;
    if (b.hasAttribute('data-fermer')) { fermerAtelier(); return; }
    if (b.hasAttribute('data-filtre')) { filtre = b.getAttribute('data-filtre'); rendreAtelier(); return; }
    if (b.hasAttribute('data-retirer') && choisi) { var o = ou(dispo, choisi.frag); if (o) delete dispo[o.face][o.cell]; choisi = null; sauver(); rendreAtelier(); dessinerCube(); legender(); return; }
    if (b.hasAttribute('data-frag')) { var id = b.getAttribute('data-frag'); choisi = choisi && choisi.frag === id ? null : { frag: id }; rendreAtelier(); focusSur('[data-frag="' + id + '"]'); return; }
    if (b.hasAttribute('data-cell')) {
      var i = +b.getAttribute('data-cell'), occupant = dispo[f.id][i];
      if (choisi && choisi.frag && occupant !== choisi.frag) {
        /* poser ou déplacer : le fragment quitte sa case précédente ; l’occupant éventuel prend sa place (échange), rien ne disparaît */
        var avant = ou(dispo, choisi.frag);
        if (avant) delete dispo[avant.face][avant.cell];
        if (occupant) { if (avant) dispo[avant.face][avant.cell] = occupant; }
        dispo[f.id][i] = choisi.frag; choisi = null; sauver(); rendreAtelier(); dessinerCube(); legender(); focusSur('[data-cell="' + i + '"]');
      } else if (occupant) { choisi = choisi && choisi.frag === occupant ? null : { frag: occupant, face: f.id, cell: i }; rendreAtelier(); focusSur('[data-cell="' + i + '"]'); }
    }
  });
  function focusSur(sel) { var el = atelier.querySelector(sel); if (el) el.focus(); }
  function fermerAtelier() { if (atelier.open && atelier.close) atelier.close(); else atelier.removeAttribute('open'); }
  atelier.addEventListener('close', function () { faceOuverte = null; choisi = null; scene.focus({ preventScroll: true }); });

  /* ---------- le patron : le Cube à plat, sans 3D ---------- */
  var patron = document.getElementById('patron');
  function dessinerPatron() {
    patron.innerHTML = FACES.map(function (f) {
      var cells = ''; for (var i = 0; i < N * N; i++) cells += caseHTML(f, i);
      return '<button type="button" class="pt-face pt-' + f.position + '" data-ouvrir="' + f.id + '" aria-label="Face ' + esc(f.nom) + ', ' + esc(f.verbe) + ' : ' + Object.keys(dispo[f.id]).length + ' fragments. Agrandir sa grille"><span class="cs-grille" style="--n:' + N + '">' + cells + '</span><span class="pt-nom">' + esc(f.nom) + ' · ' + esc(f.verbe) + '</span></button>';
    }).join('') + '<button type="button" class="pt-face pt-avant pt-ouverte" data-entrer-patron aria-label="Face ouverte, TEMPS : regarder la chronologie à l’intérieur"><span class="pt-nom">TEMPS · Traverser</span><span class="pt-vide">Ouverte</span></button>';
  }
  patron.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.hasAttribute('data-ouvrir')) agrandir(b.getAttribute('data-ouvrir')); else entrer(); });
  var dessinerCube0 = dessinerCube; dessinerCube = function () { dessinerCube0(); dessinerPatron(); };

  dessinerCube(); poser();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (v) { cancelAnimationFrame(raf); if (v[0].isIntersecting) { dernier = 0; raf = requestAnimationFrame(boucle); } }).observe(scene);
  else raf = requestAnimationFrame(boucle);

  /* pour les vérifications : l’état, et l’invariant « une seule mémoire » */
  A.cubeSaintLuc = { dispo: function () { return JSON.parse(JSON.stringify(dispo)); }, fragments: FRAG.length, poses: poses, unique: function () { var vu = {}, ok = true; FACES.forEach(function (f) { Object.keys(dispo[f.id]).forEach(function (c) { var id = dispo[f.id][c]; if (vu[id]) ok = false; vu[id] = 1; }); }); return ok; } };
})();
