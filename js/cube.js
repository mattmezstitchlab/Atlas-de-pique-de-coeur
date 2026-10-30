/* Le Cube d’ATLAS : une cartographie. Un cube mosaïque translucide, en vraie 3D (CSS 3D), au pointeur, au doigt et au clavier.
   Chaque face est une partie de l’accueil : la toucher (ou Entrée) fait descendre vers sa section, où sont les entrées.
   Les repères : le dock du bas porte les six faces (le survol tourne le Cube, la face visible s’y allume),
   et un patron (le Cube déplié en croix) dit où l’on est, sous le Cube et en tête de chaque section.
   La loupe : « MATT MEZ », derrière le Cube, est redessiné grossi à l’intérieur de sa silhouette projetée. */
(function () {
  var FACES = [
    { id: 'avant', mot: 'Chronologie', sous: 'Explorer les recherches', section: 'chronologie', rx: 0, ry: 0, motif: [1,0,1,0,1,0,1,0,1] },
    { id: 'droite', mot: 'Composition', sous: 'Créer avec les blocs', section: 'composition', rx: 0, ry: -90, motif: [1,1,0,1,1,0,0,0,1] },
    { id: 'arriere', mot: 'Archives', sous: 'Saint-Luc, 1999 – 2005', section: 'archives', rx: 0, ry: -180, motif: [0,1,0,1,1,1,0,1,0] },
    { id: 'gauche', mot: 'Relations', sous: 'Du cube à la grille', section: 'relations', rx: 0, ry: -270, motif: [1,0,0,0,1,0,0,0,1] },
    { id: 'haut', mot: 'Modules', sous: 'Timeline, Agenda, Facture…', section: 'modules', rx: -90, ry: 0, motif: [1,1,1,0,0,0,1,1,1] },
    { id: 'bas', mot: 'Écosystème', sous: 'Les projets et leur état', section: 'projets', rx: 90, ry: 0, motif: [0,0,1,0,1,0,1,0,0] }
  ];
  var PAR_ID = {}; FACES.forEach(function (f) { PAR_ID[f.id] = f; });
  var A = window.ATLAS = window.ATLAS || {};
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* le patron : le Cube déplié en croix (le haut au-dessus de l’avant, puis gauche · avant · droite · arrière, le bas dessous) */
  var PLACE = { haut: [2, 1], gauche: [1, 2], avant: [2, 2], droite: [3, 2], arriere: [4, 2], bas: [2, 3] };
  function patron(actif) {
    return FACES.map(function (f) {
      return '<a class="patron-case" href="#' + f.section + '" data-face="' + f.id + '" style="grid-column:' + PLACE[f.id][0] + ';grid-row:' + PLACE[f.id][1] + '"' +
        (f.id === actif ? ' aria-current="true"' : '') + ' title="' + esc(f.mot) + '"><span class="sr-only">' + esc(f.mot) + (f.id === actif ? ' (cette face)' : '') + '</span></a>';
    }).join('');
  }
  Array.prototype.forEach.call(document.querySelectorAll('.repere[data-face]'), function (r) { r.innerHTML = patron(r.getAttribute('data-face')); });

  var stage = document.getElementById('scene'), scene = document.getElementById('cube-scene'), cube = document.getElementById('le-cube');
  var legende = document.getElementById('cube-face'), carte = document.getElementById('patron-cube'), loupe = document.getElementById('loupe'), fond = document.getElementById('titre-plan');
  if (!scene || !cube) return;
  var calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dock = Array.prototype.slice.call(document.querySelectorAll('#dock .lieu[data-face]'));

  cube.innerHTML = '<span class="coeur-point" aria-hidden="true"></span>' + FACES.map(function (f) {
    return '<a class="face face-' + f.id + '" href="#' + f.section + '" tabindex="-1" aria-hidden="true" draggable="false" data-face="' + f.id + '"><span class="cases">' +
      f.motif.map(function (m, i) { return '<i class="case' + (m ? ' lumineuse' : '') + '" style="--d:' + i + '"></i>'; }).join('') + '</span>' +
      '<span class="face-mot"><b>' + esc(f.mot) + '</b><small>' + esc(f.sous) + '</small></span></a>';
  }).join('');

  /* ---------- l’orientation : rx, ry en degrés ---------- */
  var rx = -18, ry = 32, vx = 0, vy = 0, glisse = null, dernierGeste = -1e9, raf = 0, dernier = 0, anim = 0;
  var rad = function (d) { return d * Math.PI / 180; };
  /* un point du Cube (repère CSS : x à droite, y vers le bas, z vers nous) après rotateX(rx) rotateY(ry) */
  function tourner(p) {
    var a = rad(rx), b = rad(ry);
    var x1 = p[0] * Math.cos(b) + p[2] * Math.sin(b), z1 = -p[0] * Math.sin(b) + p[2] * Math.cos(b);
    return [x1, p[1] * Math.cos(a) - z1 * Math.sin(a), p[1] * Math.sin(a) + z1 * Math.cos(a)];
  }
  var NORMALES = { avant: [0, 0, 1], droite: [1, 0, 0], arriere: [0, 0, -1], gauche: [-1, 0, 0], haut: [0, -1, 0], bas: [0, 1, 0] };
  function visible() {
    var meilleur = null, score = -2;
    Object.keys(NORMALES).forEach(function (k) { var z = tourner(NORMALES[k])[2]; if (z > score) { score = z; meilleur = k; } });
    return PAR_ID[meilleur];
  }

  /* ---------- la loupe : l’enveloppe convexe des huit sommets projetés ---------- */
  function enveloppe(pts) {
    pts.sort(function (p, q) { return p[0] - q[0] || p[1] - q[1]; });
    var croix = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }, bas = [], haut = [];
    pts.forEach(function (p) { while (bas.length > 1 && croix(bas[bas.length - 2], bas[bas.length - 1], p) <= 0) bas.pop(); bas.push(p); });
    pts.slice().reverse().forEach(function (p) { while (haut.length > 1 && croix(haut[haut.length - 2], haut[haut.length - 1], p) <= 0) haut.pop(); haut.push(p); });
    return bas.slice(0, -1).concat(haut.slice(0, -1));
  }
  function poserLoupe() {
    if (!loupe || !stage) return;
    var c = scene.offsetWidth, h = c / 2, per = parseFloat(getComputedStyle(scene).perspective) || c * 3.4;
    var cx = stage.offsetWidth / 2, cy = stage.offsetHeight / 2, pts = [];
    [-1, 1].forEach(function (i) { [-1, 1].forEach(function (j) { [-1, 1].forEach(function (k) {
      var p = tourner([i * h, j * h, k * h]), f = per / (per - p[2]); pts.push([cx + p[0] * f, cy + p[1] * f]);
    }); }); });
    var e = enveloppe(pts).map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; });
    loupe.style.clipPath = 'polygon(' + e.join(',') + ')';
    /* le titre du fond garde un trou à la place du Cube (règle pair-impair), pour ne pas se voir deux fois */
    fond.style.clipPath = 'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ' + e.join(',') + ', ' + e[0] + ')';
  }

  var actuelle = null;
  function montrer() {
    var f = visible(); if (f === actuelle) return; actuelle = f;
    legende.innerHTML = '<b>' + esc(f.mot) + '</b> · ' + esc(f.sous) + '<span class="cube-astuce"> — glissez pour tourner, touchez la face pour y descendre</span>';
    Array.prototype.forEach.call(cube.querySelectorAll('.face'), function (el) { el.classList.toggle('face-visible', el.getAttribute('data-face') === f.id); });
    dock.forEach(function (a) { a.classList.toggle('en-face', a.getAttribute('data-face') === f.id); });
    if (carte) carte.innerHTML = patron(f.id);
  }
  function poser() { cube.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)'; poserLoupe(); montrer(); }

  /* le Cube tourne seul, doucement, tant qu’on ne l’a pas touché depuis six secondes */
  function boucle(t) {
    var dt = Math.min(48, t - (dernier || t)); dernier = t;
    if (!glisse && !anim) {
      if (Math.abs(vx) + Math.abs(vy) > 0.004) { ry += vy * dt; rx += vx * dt; var k = Math.pow(0.94, dt / 16); vx *= k; vy *= k; }
      else if (!calme && performance.now() - dernierGeste > 6000) ry += 0.006 * dt;
      rx = Math.max(-89, Math.min(89, rx)); poser();
    }
    raf = requestAnimationFrame(boucle);
  }
  /* aller vers une face, en douceur ; un nouvel appel remplace le précédent */
  function vers(f) {
    if (!f) return;
    dernierGeste = performance.now(); vx = vy = 0;
    var jeton = ++anim, cible = { rx: f.rx, ry: f.ry + 360 * Math.round((ry - f.ry) / 360) }, depart = { rx: rx, ry: ry }, t0 = performance.now(), d = calme ? 1 : 520;
    (function pas(t) {
      if (jeton !== anim) return;
      var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
      rx = depart.rx + (cible.rx - depart.rx) * e; ry = depart.ry + (cible.ry - depart.ry) * e; poser();
      if (k < 1) requestAnimationFrame(pas); else { anim = 0; dernierGeste = performance.now(); }
    })(t0);
  }
  function descendre(f) {
    var s = document.getElementById(f.section); if (!s) return;
    history.pushState(null, '', '#' + f.section);
    s.scrollIntoView({ behavior: calme ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- saisir : partout dans la scène (pas seulement sur le Cube) ---------- */
  var zone = stage || scene;
  zone.addEventListener('dragstart', function (e) { e.preventDefault(); });
  zone.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    glisse = { x: e.clientX, y: e.clientY, t: performance.now(), bouge: 0, id: e.pointerId }; anim = 0; vx = vy = 0; dernierGeste = performance.now();
  });
  zone.addEventListener('pointermove', function (e) {
    if (!glisse || e.pointerId !== glisse.id) return;
    var dx = e.clientX - glisse.x, dy = e.clientY - glisse.y, t = performance.now(), dt = Math.max(1, t - glisse.t);
    glisse.bouge += Math.abs(dx) + Math.abs(dy);
    /* la capture ne commence qu’au premier vrai mouvement : un simple toucher garde sa cible (la face) */
    if (!glisse.capte && glisse.bouge > 4) { glisse.capte = true; try { zone.setPointerCapture(e.pointerId); } catch (er) { /* rien */ } zone.classList.add('glisse'); }
    /* à l’envers (vu de dessous ou de dessus au-delà de 90°), le geste horizontal garde son sens à l’écran */
    ry += dx * 0.45; rx -= dy * 0.45; rx = Math.max(-89, Math.min(89, rx));
    vy = dx * 0.45 / dt; vx = -dy * 0.45 / dt;
    glisse.x = e.clientX; glisse.y = e.clientY; glisse.t = t; dernierGeste = t; poser();
  });
  function lacher() {
    if (!glisse) return;
    var g = glisse; glisse = null; dernier = 0; dernierGeste = performance.now(); zone.classList.remove('glisse');
    zone.dataset.glisse = g.bouge > 6 ? '1' : '';
  }
  zone.addEventListener('pointerup', lacher);
  zone.addEventListener('pointercancel', lacher);
  /* un toucher sans glisser sur une face descend vers sa section ; après un glisser, rien ne s’ouvre */
  cube.addEventListener('click', function (e) {
    var a = e.target.closest('.face'); e.preventDefault();
    if (zone.dataset.glisse) { zone.dataset.glisse = ''; return; }
    if (a) descendre(PAR_ID[a.getAttribute('data-face')]);
  });
  scene.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); descendre(actuelle); return; }
    var pas = { ArrowRight: [0, -90], ArrowLeft: [0, 90], ArrowUp: [-90, 0], ArrowDown: [90, 0] }[e.key];
    if (!pas) return;
    e.preventDefault();
    var cible = { rx: Math.max(-90, Math.min(90, Math.round(rx / 90) * 90 + pas[0])), ry: Math.round(ry / 90) * 90 + pas[1] };
    if (Math.abs(cible.rx) === 90) cible.ry = Math.round(ry / 90) * 90;
    vers({ rx: cible.rx, ry: cible.ry });
  });

  /* ---------- le dock du bas : les six faces ; le survol (ou le focus) tourne le Cube, le clic descend vers la section ---------- */
  dock.forEach(function (a) {
    var f = PAR_ID[a.getAttribute('data-face')];
    a.addEventListener('mouseenter', function () { vers(f); });
    a.addEventListener('focus', function () { vers(f); });
  });
  if (carte) {
    carte.addEventListener('mouseover', function (e) { var c = e.target.closest('.patron-case'); if (c) vers(PAR_ID[c.getAttribute('data-face')]); });
    carte.addEventListener('focusin', function (e) { var c = e.target.closest('.patron-case'); if (c) vers(PAR_ID[c.getAttribute('data-face')]); });
  }

  A.cube = { faces: FACES, vers: function (id) { vers(PAR_ID[id]); }, visible: function () { return actuelle && actuelle.id; } };
  poser();
  window.addEventListener('resize', poserLoupe);
  /* ne tourner que lorsque le Cube est à l’écran */
  if ('IntersectionObserver' in window) new IntersectionObserver(function (v) { cancelAnimationFrame(raf); if (v[0].isIntersecting) { dernier = 0; raf = requestAnimationFrame(boucle); } }).observe(scene);
  else raf = requestAnimationFrame(boucle);
})();
