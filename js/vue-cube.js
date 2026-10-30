/* La vue Cube : le Cube d’ATLAS en verre, vu de l’intérieur.
   - Six faces, les mêmes que l’accueil et aux mêmes places. Chaque face est une grille remplie des vrais fragments
     (data/chronologie.js, data/histoire.js, data/applications.js, data/modules.js, data/projets.js) ; une case vide est dite vide.
   - Les faces opposées forment trois axes qui passent par le centre :
       le Temps (Chronologie ↔ Archives), la Structure (Composition ↔ Relations), l’Usage (Modules ↔ Écosystème).
   - L’orbe, au centre, ne navigue pas (ce n’est pas le Disque) : elle marque le centre, porte les trois axes,
     et relie la case choisie à ce qui la touche réellement (des fils de lumière vers les autres faces). La toucher ramène au centre.
   - Le panneau à côté dit la même chose en texte : c’est aussi la vue sans 3D. */
(function () {
  var A = window.ATLAS, C = A.chronologie, H = A.histoire;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fr = function (s) { return esc(s).replace(/ ([:;?!»])/g, ' $1').replace(/« /g, '« '); };
  var calme = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- les fragments, et ce qui les relie (seulement ce que les données disent) ---------- */
  var items = {}, liens = {};
  function item(id, o) { o.id = id; items[id] = o; liens[id] = liens[id] || {}; return o; }
  function relier(a, b) { if (!items[a] || !items[b] || a === b) return; liens[a][b] = 1; liens[b][a] = 1; }
  var annee = function (e) { return String(e.dateStart || '').slice(0, 4); };
  var entreeDe = {};
  var chrono = C.entrees.map(function (e) {
    (e.archiveIds || []).forEach(function (a) { entreeDe[a] = e.id; });
    return item('e:' + e.id, { court: annee(e), titre: e.title, sous: annee(e) + (e.dateEnd && e.dateEnd !== e.dateStart ? ' – ' + e.dateEnd : ''), href: 'chronologie.html#' + e.id });
  }).concat(H.chapitres.map(function (c) { return item('c:' + c.id, { court: c.id.slice(0, 3), titre: c.titre, sous: 'Époque ' + c.id + ' · 2025 – 2026', href: 'chronologie.html#' + c.id }); }));
  var archives = C.archives.map(function (a) { return item('a:' + a.id, { court: String(a.originalDate || '').slice(0, 4), titre: a.title, sous: (a.originalDate || 'date à vérifier') + (a.attente ? ' · à déposer' : ''), href: 'chronologie.html#' + (entreeDe[a.id] || 'avant') }); });
  var NATURE = { devenu: 'devenu', eclaire: 'éclaire', suite: 'suite' };
  var relations = C.relations.map(function (r, i) {
    return item('r:' + i, { court: NATURE[r.nature] || r.nature, titre: (r.justification || '').split(' : ')[0] || r.nature, sous: 'Relation « ' + (NATURE[r.nature] || r.nature) + ' » · ' + r.de.replace(/^e-/, '') + ' → ' + r.vers.replace(/^(chapitre|page):/, ''), href: 'chronologie.html#' + r.de, rel: r });
  });
  var familles = A.familles.map(function (f) { return item('f:' + f.id, { court: f.nom.split(/[ ,]/)[0], titre: f.nom, sous: 'Famille · ' + A.applications.filter(function (a) { return a[2] === f.id; }).length + ' applications', href: 'composition.html#atelier' }); });
  var modules = A.modules.map(function (m) { return item('m:' + m.id, { court: m.titre, titre: m.titre, sous: 'Module · ' + (m.capacites.length ? m.capacites.length + ' capacités de l’atlas' : 'né des noms répétés'), href: 'composition.html#atelier', famille: m.famille }); });
  var projets = A.projets.map(function (p, i) { return item('p:' + i, { court: p.titre.split(/[ —,]/)[0], titre: p.titre, sous: p.etat + (p.annee ? ' · ' + p.annee : ''), href: 'ecosysteme.html', etat: p.etat }); });

  C.entrees.forEach(function (e) { (e.archiveIds || []).forEach(function (a) { relier('e:' + e.id, 'a:' + a); }); (e.relatedEntryIds || []).forEach(function (o) { relier('e:' + e.id, 'e:' + o); }); });
  C.relations.forEach(function (r, i) {
    [r.de, r.vers].forEach(function (bout) {
      var m = /^chapitre:(.+)$/.exec(bout); relier('r:' + i, m ? 'c:' + m[1] : 'e:' + bout);
    });
  });
  modules.forEach(function (m) { relier(m.id, 'f:' + m.famille); });

  /* ---------- les six faces : mêmes noms, mêmes places que l’accueil ---------- */
  var FACES = [
    { id: 'avant', mot: 'Chronologie', sous: 'Explorer les recherches', axe: 'temps', liste: chrono, rx: 0, ry: 0 },
    { id: 'droite', mot: 'Composition', sous: 'Créer avec les blocs', axe: 'structure', liste: familles, rx: 0, ry: -90 },
    { id: 'arriere', mot: 'Archives', sous: 'Saint-Luc, 1999 – 2005', axe: 'temps', liste: archives, rx: 0, ry: -180 },
    { id: 'gauche', mot: 'Relations', sous: 'Du cube à la grille', axe: 'structure', liste: relations, rx: 0, ry: -270 },
    { id: 'haut', mot: 'Modules', sous: 'Timeline, Agenda, Facture…', axe: 'usage', liste: modules, rx: -90, ry: 0 },
    { id: 'bas', mot: 'Écosystème', sous: 'Les projets et leur état', axe: 'usage', liste: projets, rx: 90, ry: 0 }
  ];
  var AXES = { temps: { nom: 'le Temps', dit: 'ce qui s’est passé, et ses preuves' }, structure: { nom: 'la Structure', dit: 'ce que l’on compose, et ce qui le relie' }, usage: { nom: 'l’Usage', dit: 'les outils, et les projets qui s’en servent' } };
  var OPPOSEE = { avant: 'arriere', arriere: 'avant', droite: 'gauche', gauche: 'droite', haut: 'bas', bas: 'haut' };
  var PAR_ID = {}; FACES.forEach(function (f) { PAR_ID[f.id] = f; f.liste.forEach(function (it) { it.face = f.id; }); });

  var scene = document.getElementById('vc-scene'), cube = document.getElementById('vc-cube'), etat = document.getElementById('vc-etat'), panneau = document.getElementById('vc-panneau');
  var dock = Array.prototype.slice.call(document.querySelectorAll('#dock .lieu[data-face]'));

  /* chaque face : une grille n × n, n = le plus petit carré qui contient ses fragments */
  cube.innerHTML = FACES.map(function (f) {
    var n = Math.max(2, Math.ceil(Math.sqrt(f.liste.length))), cases = '';
    for (var i = 0; i < n * n; i++) {
      var it = f.liste[i];
      cases += it ? '<button type="button" class="vc-case" tabindex="-1" data-item="' + it.id + '"' + (it.etat ? ' data-etat="' + esc(it.etat) + '"' : '') + ' title="' + esc(it.titre) + '"><span>' + esc(it.court) + '</span></button>' : '<i class="vc-case vide" aria-hidden="true"></i>';
    }
    return '<div class="vc-face vc-face-' + f.id + '" data-face="' + f.id + '" aria-hidden="true"><div class="vc-grille" style="--n:' + n + '">' + cases + '</div>' +
      '<p class="vc-face-mot"><b>' + esc(f.mot) + '</b><small>' + f.liste.length + ' fragment' + (f.liste.length > 1 ? 's' : '') + '</small></p></div>';
  }).join('') +
  '<div class="vc-axes" aria-hidden="true"><i class="vc-axe" data-axe="temps"></i><i class="vc-axe" data-axe="temps"></i><i class="vc-axe" data-axe="structure"></i><i class="vc-axe" data-axe="structure"></i><i class="vc-axe" data-axe="usage"></i><i class="vc-axe" data-axe="usage"></i></div>' +
  '<div class="vc-fils" id="vc-fils" aria-hidden="true"></div>' +
  '<div class="vc-orbe" id="vc-orbe" aria-hidden="true"><span></span></div>';
  var orbe = document.getElementById('vc-orbe'), fils = document.getElementById('vc-fils');

  /* ---------- la géométrie : un point 3D du Cube, et un fil du centre vers ce point ---------- */
  var cote = function () { return scene.offsetWidth; };
  function point(faceId, u, v) {   /* (u, v) dans le plan de la face, à partir de son centre ; renvoie (x, y, z) dans le Cube */
    var h = cote() / 2, r = Math.PI / 2;
    switch (faceId) {
      case 'avant': return [u, v, h];
      case 'droite': return [u * Math.cos(r) + h * Math.sin(r), v, -u * Math.sin(r) + h * Math.cos(r)];
      case 'arriere': return [-u, v, -h];
      case 'gauche': return [-h, v, u];
      case 'haut': return [u, -h, v];
      default: return [u, h, -v];
    }
  }
  function fil(p, classe) {   /* un trait du centre vers p : rotateY(a) rotateZ(b) sur un trait couché selon x */
    var L = Math.hypot(p[0], p[1], p[2]), h = Math.hypot(p[0], p[2]), a = Math.atan2(-p[2], p[0]), b = Math.atan2(p[1], h);
    return '<i class="' + classe + '" style="width:' + L.toFixed(1) + 'px;transform:rotateY(' + a.toFixed(4) + 'rad) rotateZ(' + b.toFixed(4) + 'rad)"></i>';
  }
  function poserAxes() {
    var h = cote() / 2, bouts = [[0, 0, h], [0, 0, -h], [h, 0, 0], [-h, 0, 0], [0, -h, 0], [0, h, 0]];
    Array.prototype.forEach.call(cube.querySelectorAll('.vc-axe'), function (el, i) {
      var p = bouts[i], a = Math.atan2(-p[2], p[0]), b = Math.atan2(p[1], Math.hypot(p[0], p[2]));
      el.style.width = h + 'px'; el.style.transform = 'rotateY(' + a + 'rad) rotateZ(' + b + 'rad)';
    });
  }

  /* ---------- l’orientation ---------- */
  var DEPART = { rx: -22, ry: 34 };
  var rx = DEPART.rx, ry = DEPART.ry, vx = 0, vy = 0, glisse = null, dernierGeste = -1e9, raf = 0, dernier = 0, anim = 0;
  var rad = function (d) { return d * Math.PI / 180; };
  function tourner(p) {
    var a = rad(rx), b = rad(ry), x1 = p[0] * Math.cos(b) + p[2] * Math.sin(b), z1 = -p[0] * Math.sin(b) + p[2] * Math.cos(b);
    return [x1, p[1] * Math.cos(a) - z1 * Math.sin(a), p[1] * Math.sin(a) + z1 * Math.cos(a)];
  }
  var NORMALES = { avant: [0, 0, 1], droite: [1, 0, 0], arriere: [0, 0, -1], gauche: [-1, 0, 0], haut: [0, -1, 0], bas: [0, 1, 0] };
  function visible() { var m = null, s = -2; Object.keys(NORMALES).forEach(function (k) { var z = tourner(NORMALES[k])[2]; if (z > s) { s = z; m = k; } }); return PAR_ID[m]; }
  var actuelle = null;
  function poser() {
    cube.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    orbe.style.transform = 'rotateY(' + (-ry).toFixed(2) + 'deg) rotateX(' + (-rx).toFixed(2) + 'deg)';   /* l’orbe nous fait toujours face : une sphère */
    Array.prototype.forEach.call(cube.querySelectorAll('.vc-face'), function (el) { el.classList.toggle('de-dos', tourner(NORMALES[el.getAttribute('data-face')])[2] < -0.05); });
    var f = visible();
    if (f !== actuelle) { actuelle = f; rendrePanneau(); dock.forEach(function (b) { b.classList.toggle('en-face', b.getAttribute('data-face') === f.id); }); cube.setAttribute('data-axe', f.axe); }
  }
  function boucle(t) {
    var dt = Math.min(48, t - (dernier || t)); dernier = t;
    if (!glisse && !anim) {
      if (Math.abs(vx) + Math.abs(vy) > 0.004) { ry += vy * dt; rx += vx * dt; var k = Math.pow(0.94, dt / 16); vx *= k; vy *= k; }
      else if (!calme && !choisi && performance.now() - dernierGeste > 8000) ry += 0.004 * dt;
      rx = Math.max(-89, Math.min(89, rx)); poser();
    }
    raf = requestAnimationFrame(boucle);
  }
  function vers(o) {
    dernierGeste = performance.now(); vx = vy = 0;
    var jeton = ++anim, cible = { rx: o.rx, ry: o.ry + 360 * Math.round((ry - o.ry) / 360) }, d0 = { rx: rx, ry: ry }, t0 = performance.now(), d = calme ? 1 : 560;
    (function pas(t) {
      if (jeton !== anim) return;
      var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
      rx = d0.rx + (cible.rx - d0.rx) * e; ry = d0.ry + (cible.ry - d0.ry) * e; poser();
      if (k < 1) requestAnimationFrame(pas); else { anim = 0; dernierGeste = performance.now(); }
    })(t0);
  }

  /* ---------- choisir une case : l’orbe la relie à ce qui la touche ---------- */
  var choisi = null;
  function choisir(id) {
    choisi = id && items[id] ? id : null;
    Array.prototype.forEach.call(cube.querySelectorAll('.vc-case[data-item]'), function (b) {
      var k = b.getAttribute('data-item');
      b.classList.toggle('choisie', k === choisi);
      b.classList.toggle('reliee', !!(choisi && liens[choisi][k]));
    });
    cube.classList.toggle('a-choix', !!choisi);
    var h = cote() / 2;
    fils.innerHTML = choisi ? [choisi].concat(Object.keys(liens[choisi])).map(function (k) {
      var b = cube.querySelector('.vc-case[data-item="' + k + '"]'); if (!b) return '';
      var u = b.offsetLeft + b.offsetWidth / 2 + b.parentNode.offsetLeft - h, v = b.offsetTop + b.offsetHeight / 2 + b.parentNode.offsetTop - h;
      return fil(point(items[k].face, u, v), 'vc-fil' + (k === choisi ? ' vc-fil-choisi' : ''));
    }).join('') : '';
    if (choisi) { var it = items[choisi], n = Object.keys(liens[choisi]).length; etat.textContent = it.titre + (n ? ' · relié à ' + n + ' fragment' + (n > 1 ? 's' : '') : ' · aucune relation enregistrée'); }
    else etat.textContent = '';
    rendrePanneau();
  }
  function auCentre() { choisir(null); vers(DEPART); etat.textContent = 'Au centre : les trois axes, le Temps, la Structure, l’Usage.'; }

  /* ---------- le panneau : la face en regard, et le fragment choisi ---------- */
  function ligneItem(k, avecFace) {
    var it = items[k];
    return '<li><button type="button" class="vc-item' + (k === choisi ? ' choisi' : '') + '" data-item="' + k + '"><b>' + fr(it.titre) + '</b><small>' + fr(it.sous) + (avecFace ? ' · ' + esc(PAR_ID[it.face].mot) : '') + '</small></button></li>';
  }
  function rendrePanneau() {
    var f = actuelle || FACES[0], ax = AXES[f.axe], op = PAR_ID[OPPOSEE[f.id]], h = '';
    if (choisi) {
      var it = items[choisi], ls = Object.keys(liens[choisi]);
      h += '<section class="vc-choix" aria-label="Le fragment choisi"><p class="surtitre">Choisi · ' + esc(PAR_ID[it.face].mot) + '</p><h2>' + fr(it.titre) + '</h2><p class="vc-sous">' + fr(it.sous) + '</p>' +
        (ls.length ? '<p class="vc-relie">Relié à ' + ls.length + ' fragment' + (ls.length > 1 ? 's' : '') + ', d’après les données :</p><ul class="vc-liste">' + ls.map(function (k) { return ligneItem(k, true); }).join('') + '</ul>'
          : '<p class="vc-relie">Aucune relation enregistrée pour ce fragment. Une relation s’ajoute dans l’éditeur, avec sa justification.</p>') +
        '<p class="vc-actions"><a class="vc-ouvrir" href="' + esc(it.href) + '">Ouvrir dans ATLAS</a> <button type="button" class="vc-centre" data-centre>Revenir au centre</button></p></section>';
    }
    h += '<section class="vc-face-texte" aria-label="La face en regard"><p class="surtitre">Face en regard · ' + esc(f.sous) + '</p><h2>' + esc(f.mot) + '</h2>' +
      '<p class="vc-axe-texte">Sur l’axe de ' + esc(ax.nom) + ' (' + esc(ax.dit) + '), en face de <button type="button" class="vc-lien" data-face="' + op.id + '">' + esc(op.mot) + '</button>.</p>' +
      '<ul class="vc-liste">' + f.liste.map(function (it) { return ligneItem(it.id); }).join('') + '</ul></section>';
    panneau.innerHTML = h;
  }
  panneau.addEventListener('click', function (e) {
    var b = e.target.closest('[data-item]'); if (b) { var k = b.getAttribute('data-item'); var it = items[k]; if (PAR_ID[it.face] !== actuelle) vers(PAR_ID[it.face]); choisir(k); return; }
    var f = e.target.closest('[data-face]'); if (f) { vers(PAR_ID[f.getAttribute('data-face')]); return; }
    if (e.target.closest('[data-centre]')) auCentre();
  });

  /* ---------- les gestes ---------- */
  scene.addEventListener('dragstart', function (e) { e.preventDefault(); });
  scene.addEventListener('pointerdown', function (e) { if (e.button !== undefined && e.button !== 0) return; glisse = { x: e.clientX, y: e.clientY, t: performance.now(), bouge: 0, id: e.pointerId }; anim = 0; vx = vy = 0; dernierGeste = performance.now(); });
  scene.addEventListener('pointermove', function (e) {
    if (!glisse || e.pointerId !== glisse.id) return;
    var dx = e.clientX - glisse.x, dy = e.clientY - glisse.y, t = performance.now(), dt = Math.max(1, t - glisse.t);
    glisse.bouge += Math.abs(dx) + Math.abs(dy);
    if (!glisse.capte && glisse.bouge > 4) { glisse.capte = true; try { scene.setPointerCapture(e.pointerId); } catch (er) { /* rien */ } scene.classList.add('glisse'); }
    ry += dx * 0.4; rx -= dy * 0.4; rx = Math.max(-89, Math.min(89, rx)); vy = dx * 0.4 / dt; vx = -dy * 0.4 / dt;
    glisse.x = e.clientX; glisse.y = e.clientY; glisse.t = t; dernierGeste = t; poser();
  });
  function lacher() { if (!glisse) return; scene.dataset.glisse = glisse.bouge > 6 ? '1' : ''; glisse = null; dernier = 0; dernierGeste = performance.now(); scene.classList.remove('glisse'); }
  scene.addEventListener('pointerup', lacher); scene.addEventListener('pointercancel', lacher);
  /* un toucher : l’orbe d’abord (on la voit à travers le verre), sinon la case touchée */
  scene.addEventListener('click', function (e) {
    if (scene.dataset.glisse) { scene.dataset.glisse = ''; e.preventDefault(); return; }
    var r = orbe.getBoundingClientRect(), d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    if (d < r.width / 2) { e.preventDefault(); auCentre(); return; }
    var b = e.target.closest('.vc-case[data-item]'); if (b) choisir(b.getAttribute('data-item') === choisi ? null : b.getAttribute('data-item'));
  }, true);
  scene.addEventListener('mouseover', function (e) { var b = e.target.closest('.vc-case[data-item]'); if (b && !choisi) etat.textContent = items[b.getAttribute('data-item')].titre; });
  scene.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Home') { e.preventDefault(); auCentre(); return; }
    var pas = { ArrowRight: [0, -90], ArrowLeft: [0, 90], ArrowUp: [-90, 0], ArrowDown: [90, 0] }[e.key]; if (!pas) return;
    e.preventDefault();
    var c = { rx: Math.max(-90, Math.min(90, Math.round(rx / 90) * 90 + pas[0])), ry: Math.round(ry / 90) * 90 + pas[1] };
    if (Math.abs(c.rx) === 90) c.ry = Math.round(ry / 90) * 90;
    vers(c);
  });
  dock.forEach(function (b) {
    var f = PAR_ID[b.getAttribute('data-face')];
    b.addEventListener('mouseenter', function () { vers(f); });
    b.addEventListener('focus', function () { vers(f); });
    b.addEventListener('click', function () { vers(f); });
  });

  A.vueCube = { faces: FACES, items: items, liens: liens, choisir: choisir, vers: function (id) { vers(PAR_ID[id]); }, visible: function () { return actuelle && actuelle.id; }, choisi: function () { return choisi; } };
  poserAxes(); poser();
  window.addEventListener('resize', function () { poserAxes(); if (choisi) choisir(choisi); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (v) { cancelAnimationFrame(raf); if (v[0].isIntersecting) { dernier = 0; raf = requestAnimationFrame(boucle); } }).observe(scene);
  else raf = requestAnimationFrame(boucle);
})();
