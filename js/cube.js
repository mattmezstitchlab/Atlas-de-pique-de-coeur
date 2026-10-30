/* Le Cube d’ATLAS : un cube mosaïque translucide, en vraie 3D (CSS 3D), au pointeur, au doigt et au clavier.
   Chaque face ouvre un espace réel. La liste des faces, sous le Cube, en est l’alternative sans 3D.
   Le Point est au centre du Cube : le carré contient le Point. */
(function () {
  var FACES = [
    { id: 'avant', mot: 'Chronologie', sous: 'Explorer les recherches', href: 'chronologie.html', rx: 0, ry: 0, motif: [1,0,1,0,1,0,1,0,1] },
    { id: 'droite', mot: 'Composition', sous: 'Créer avec les blocs', href: 'composition.html', rx: 0, ry: -90, motif: [1,1,0,1,1,0,0,0,1] },
    { id: 'arriere', mot: 'Archives', sous: 'Saint-Luc, 1999 – 2005', href: 'chronologie.html#avant', rx: 0, ry: -180, motif: [0,1,0,1,1,1,0,1,0] },
    { id: 'gauche', mot: 'Relations', sous: 'Du cube à la grille', href: 'chronologie.html#e-cube-grille', rx: 0, ry: -270, motif: [1,0,0,0,1,0,0,0,1] },
    { id: 'haut', mot: 'Modules', sous: 'Timeline, Agenda, Facture…', href: 'composition.html#atelier', rx: -90, ry: 0, motif: [1,1,1,0,0,0,1,1,1] },
    { id: 'bas', mot: 'Écosystème', sous: 'Les projets et leur état', href: 'ecosysteme.html', rx: 90, ry: 0, motif: [0,0,1,0,1,0,1,0,0] }
  ];
  var scene = document.getElementById('cube-scene'), cube = document.getElementById('le-cube'), legende = document.getElementById('cube-face'), liste = document.getElementById('faces-liste');
  if (!scene || !cube) return;
  var calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  cube.innerHTML = '<span class="coeur-point" aria-hidden="true"></span>' + FACES.map(function (f) {
    return '<a class="face face-' + f.id + '" href="' + esc(f.href) + '" tabindex="-1" aria-hidden="true" data-face="' + f.id + '"><span class="cases">' +
      f.motif.map(function (m, i) { return '<i class="case' + (m ? ' lumineuse' : '') + '" style="--d:' + i + '"></i>'; }).join('') + '</span>' +
      '<span class="face-mot"><b>' + esc(f.mot) + '</b><small>' + esc(f.sous) + '</small></span></a>';
  }).join('');
  liste.innerHTML = FACES.map(function (f) { return '<li><a href="' + esc(f.href) + '"><b>' + esc(f.mot) + '</b><span>' + esc(f.sous) + '</span></a></li>'; }).join('');

  /* l’orientation : rx, ry en degrés ; la face visible est celle dont la normale regarde le plus vers nous */
  var rx = -18, ry = 32, vx = 0, vy = 0, glisse = null, touche = false, raf = 0, dernier = 0;
  function poser() { cube.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)'; montrer(); }
  var NORMALES = { avant: [0, 0, 1], droite: [1, 0, 0], arriere: [0, 0, -1], gauche: [-1, 0, 0], haut: [0, -1, 0], bas: [0, 1, 0] };   /* repère CSS : y vers le bas, z vers nous */
  function visible() {
    var a = rx * Math.PI / 180, b = ry * Math.PI / 180, meilleur = null, score = -2;
    Object.keys(NORMALES).forEach(function (k) {
      var n = NORMALES[k], x = n[0], y = n[1], z = n[2];
      var x1 = x * Math.cos(b) + z * Math.sin(b), z1 = -x * Math.sin(b) + z * Math.cos(b);   /* rotateY */
      var z2 = y * Math.sin(a) + z1 * Math.cos(a);                                            /* puis rotateX */
      void x1; if (z2 > score) { score = z2; meilleur = k; }
    });
    return FACES.filter(function (f) { return f.id === meilleur; })[0];
  }
  var actuelle = null;
  function montrer() {
    var f = visible(); if (f === actuelle) return; actuelle = f;
    legende.innerHTML = '<b>' + esc(f.mot) + '</b> · ' + esc(f.sous) + '<span class="cube-astuce"> — Entrée ou toucher pour ouvrir</span>';
    Array.prototype.forEach.call(cube.querySelectorAll('.face'), function (el) { el.classList.toggle('face-visible', el.getAttribute('data-face') === f.id); });
  }
  function boucle(t) {
    var dt = Math.min(48, t - (dernier || t)); dernier = t;
    if (!glisse) {
      if (Math.abs(vx) + Math.abs(vy) > 0.01) { ry += vy * dt; rx += vx * dt; vx *= 0.94; vy *= 0.94; }
      else if (!touche && !calme) ry += 0.006 * dt;
      rx = Math.max(-85, Math.min(85, rx)); poser();
    }
    raf = requestAnimationFrame(boucle);
  }
  /* aller vers une face, en douceur */
  function vers(f) {
    touche = true; vx = vy = 0;
    var cible = { rx: f.rx, ry: f.ry + 360 * Math.round((ry - f.ry) / 360) }, depart = { rx: rx, ry: ry }, t0 = performance.now(), d = calme ? 1 : 520;
    cancelAnimationFrame(raf);
    (function pas(t) { var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); rx = depart.rx + (cible.rx - depart.rx) * e; ry = depart.ry + (cible.ry - depart.ry) * e; poser(); if (k < 1) requestAnimationFrame(pas); else { dernier = 0; raf = requestAnimationFrame(boucle); } })(t0);
  }

  scene.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    glisse = { x: e.clientX, y: e.clientY, t: performance.now(), bouge: 0 }; touche = true; vx = vy = 0;
    try { scene.setPointerCapture(e.pointerId); } catch (er) { /* rien */ }
  });
  scene.addEventListener('pointermove', function (e) {
    if (!glisse) return;
    var dx = e.clientX - glisse.x, dy = e.clientY - glisse.y, t = performance.now(), dt = Math.max(1, t - glisse.t);
    glisse.bouge += Math.abs(dx) + Math.abs(dy);
    ry += dx * 0.45; rx -= dy * 0.45; rx = Math.max(-85, Math.min(85, rx));
    vy = dx * 0.45 / dt; vx = -dy * 0.45 / dt;
    glisse.x = e.clientX; glisse.y = e.clientY; glisse.t = t; poser();
  });
  function lacher() { if (!glisse) return; var g = glisse; glisse = null; dernier = 0; scene.dataset.glisse = g.bouge > 6 ? '1' : ''; }
  scene.addEventListener('pointerup', lacher);
  scene.addEventListener('pointercancel', lacher);
  /* un toucher (sans glisser) sur une face ouvre son espace ; un glisser ne l’ouvre pas */
  cube.addEventListener('click', function (e) { if (scene.dataset.glisse) { e.preventDefault(); scene.dataset.glisse = ''; } });
  scene.addEventListener('keydown', function (e) {
    var i = FACES.indexOf(actuelle);
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.href = actuelle.href; return; }
    var pas = { ArrowRight: [0, -90], ArrowLeft: [0, 90], ArrowUp: [-90, 0], ArrowDown: [90, 0] }[e.key];
    if (!pas) return;
    e.preventDefault(); touche = true; vx = vy = 0;
    var cible = { rx: Math.max(-90, Math.min(90, Math.round(rx / 90) * 90 + pas[0])), ry: Math.round(ry / 90) * 90 + pas[1] };
    if (Math.abs(cible.rx) === 90) cible.ry = Math.round(ry / 90) * 90;
    var t0 = performance.now(), d0 = { rx: rx, ry: ry }, d = calme ? 1 : 420; cancelAnimationFrame(raf);
    (function anim(t) { var k = Math.min(1, (t - t0) / d), q = 1 - Math.pow(1 - k, 3); rx = d0.rx + (cible.rx - d0.rx) * q; ry = d0.ry + (cible.ry - d0.ry) * q; poser(); if (k < 1) requestAnimationFrame(anim); else { dernier = 0; raf = requestAnimationFrame(boucle); } })(t0);
    void i;
  });
  /* survoler un lien de la liste tourne le Cube vers sa face */
  liste.addEventListener('mouseover', function (e) { var a = e.target.closest('a'); if (!a) return; var k = Array.prototype.indexOf.call(liste.querySelectorAll('a'), a); if (FACES[k] && FACES[k] !== actuelle) vers(FACES[k]); });
  liste.addEventListener('focusin', function (e) { var a = e.target.closest('a'); if (!a) return; var k = Array.prototype.indexOf.call(liste.querySelectorAll('a'), a); if (FACES[k]) vers(FACES[k]); });

  poser();
  /* ne tourner que lorsque le Cube est à l’écran */
  if ('IntersectionObserver' in window) new IntersectionObserver(function (v) { cancelAnimationFrame(raf); if (v[0].isIntersecting) { dernier = 0; raf = requestAnimationFrame(boucle); } }).observe(scene);
  else raf = requestAnimationFrame(boucle);
})();
