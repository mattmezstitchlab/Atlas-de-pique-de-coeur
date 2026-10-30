/* La Métamorphose : glisser les 643 projets de l’arbre vers une grille magnétique de 12 colonnes,
   où chacun reprend la forme de la Charte ; composer l’achèvement d’un geste.
   Les positions sont en unités de 12 colonnes (sur téléphone, la grille en montre 6 : une case = deux unités).
   La composition est gardée sur cet appareil (localStorage), rien n’est envoyé. */
(function () {
  var A = window.ATLAS, B = A.bloc, ACH = A.achevement;
  var CLE = 'atlas-metamorphose-v1';
  var grille = document.getElementById('grille'), aimant = document.getElementById('aimant'), compte = document.getElementById('compte');

  /* ---------- les projets : un groupe par nom (les copies et versions ensemble), dans sa famille ---------- */
  var base = function (n) { return n.replace(/\s*\(copy\)/gi, '').replace(/\s+copy$/i, '').trim(); };
  var groupes = {}, ordreGroupes = [];
  A.applications.forEach(function (a) {
    var id = a[2] + '|' + base(a[1]);
    if (!groupes[id]) { groupes[id] = { id: id, famille: a[2], nom: base(a[1]), n: 0, premier: a[0] }; ordreGroupes.push(id); }
    groupes[id].n++;
  });
  var parFamille = {}; A.familles.forEach(function (f) { parFamille[f.id] = { apps: 0, groupes: [] }; });
  A.applications.forEach(function (a) { parFamille[a[2]].apps++; });
  ordreGroupes.forEach(function (id) { parFamille[groupes[id].famille].groupes.push(groupes[id]); });
  var briques = {}; ACH.briques.forEach(function (b) { briques[b.id] = b; });

  /* ---------- la réparation : une barre par famille ---------- */
  document.getElementById('principe-texte').textContent = ACH.principe;
  var A_PART = { etudes: 1, sanstitre: 1, jeux: 1, explorations: 1 };
  var rangs = A.familles.slice().sort(function (a, b) { return (A_PART[a.id] ? 1 : 0) - (A_PART[b.id] ? 1 : 0) || parFamille[b.id].apps - parFamille[a.id].apps; });
  var max = Math.max.apply(null, A.familles.map(function (f) { return parFamille[f.id].apps; }));
  document.getElementById('barres').innerHTML = rangs.map(function (f) {
    var n = parFamille[f.id].apps;
    return '<li class="' + (A_PART[f.id] ? 'a-part' : '') + '"><b>' + B.pastille(f.id) + ' ' + B.fr(f.nom) + '</b><span class="piste" role="img" aria-label="' + B.esc(f.nom) + ' : ' + n + ' applications"><span class="plein" style="width:' + (n / max * 100).toFixed(1) + '%"></span></span><span class="n">' + n + '</span></li>';
  }).join('');

  /* ---------- l’arbre : familles en dossiers, projets en fragments ---------- */
  var zoneFamilles = document.getElementById('familles'), filtre = document.getElementById('filtre');
  var ouverts = {};   /* les dossiers ouverts restent ouverts quand la grille change */
  zoneFamilles.addEventListener('toggle', function (ev) { var d = ev.target; if (d.dataset && d.dataset.f) ouverts[d.dataset.f] = d.open; }, true);
  var sans = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  function arbre() {
    var q = sans(filtre.value.trim()), poses = {};
    etat.blocs.forEach(function (b) { if (b.type === 'groupe') poses[b.ref] = 1; });
    zoneFamilles.innerHTML = A.familles.map(function (f) {
      var gs = parFamille[f.id].groupes.filter(function (g) { return !q || sans(g.nom).indexOf(q) !== -1 || sans(f.nom).indexOf(q) !== -1; });
      if (!gs.length) return '';
      return '<details class="famille" data-f="' + f.id + '"' + (q || ouverts[f.id] ? ' open' : '') + '><summary>' + B.pastille(f.id) + B.fr(f.nom) + '<small>' + parFamille[f.id].apps + '</small></summary><ul class="fragments">' +
        gs.map(function (g) { return '<li><button type="button" class="fragment' + (poses[g.id] ? ' place' : '') + '" data-g="' + B.esc(g.id) + '" aria-label="Poser ' + B.esc(g.nom) + ' sur la grille"><span>' + B.fr(g.nom) + '</span><small>' + (g.n > 1 ? '×' + g.n : '') + '</small></button></li>'; }).join('') + '</ul></details>';
    }).join('') || '<p class="aide">Aucun projet ne contient « ' + B.esc(filtre.value) + ' ».</p>';
  }
  filtre.addEventListener('input', arbre);

  /* ---------- l’état : les blocs posés ---------- */
  var etat = { blocs: [], inverse: false };
  var uid = 0;
  function tailleDefaut(type, ref) { if (type === 'brique') { var b = briques[ref]; return { w: b.w, h: b.h }; } return { w: 3, h: 2 }; }
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* stockage indisponible : la grille reste pour la séance */ } }
  function charger() {
    try { var s = JSON.parse(localStorage.getItem(CLE) || 'null'); if (s && Array.isArray(s.blocs)) { etat = s; etat.blocs = etat.blocs.filter(function (b) { return b.type === 'brique' ? briques[b.ref] : groupes[b.ref]; }); return true; } } catch (e) { /* rien */ }
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
  function ajouter(type, ref, x, y) {
    var t = tailleDefaut(type, ref), p = x === undefined ? placer(0, 0, t.w, t.h) : placer(x, y, t.w, t.h);
    var b = { uid: 'b' + (++uid) + Date.now().toString(36), type: type, ref: ref, x: p.x, y: p.y, w: t.w, h: t.h };
    etat.blocs.push(b); rendre(); sauver(); return b;
  }

  /* ---------- la grille ---------- */
  var cols = function () { return parseInt(getComputedStyle(grille).getPropertyValue('--col'), 10) || 12; };
  var u = function () { return 12 / cols(); };   /* unités de 12 par case affichée */
  function cssPos(r) { var k = u(); return 'grid-column:' + (Math.floor(r.x / k) + 1) + ' / span ' + Math.max(1, Math.ceil(r.w / k)) + ';grid-row:' + (r.y + 1) + ' / span ' + r.h; }
  function rendre() {
    var rangs = Math.max(hauteur() + 3, 7);
    grille.style.gridTemplateRows = 'repeat(' + rangs + ', var(--rang))';
    var html = etat.blocs.map(function (b) {
      var contenu = b.type === 'brique' ? B.brique(briques[b.ref]) : B.groupe(groupes[b.ref]);
      var style = b.type === 'brique' ? briques[b.ref].style : 'carte';
      var nom = b.type === 'brique' ? briques[b.ref].titre : groupes[b.ref].nom;
      return '<article class="bloc ' + b.type + ' ' + style + '" tabindex="0" data-uid="' + b.uid + '" style="' + cssPos(b) + '" aria-label="' + B.esc(nom) + ', colonne ' + (b.x + 1) + ', rangée ' + (b.y + 1) + '">' +
        '<div class="poignee" aria-hidden="true"></div>' + contenu +
        '<div class="actions-bloc"><button type="button" data-act="taille" aria-label="Changer la taille de ' + B.esc(nom) + '">Taille</button><button type="button" data-act="retirer" aria-label="Retirer ' + B.esc(nom) + '">×</button></div></article>';
    }).join('');
    grille.innerHTML = '<div class="aimant" id="aimant" hidden></div>' + (html || '<p class="vide-grille">Glissez un fragment ici, ou composez l’achèvement.</p>');
    aimant = document.getElementById('aimant');
    var n = etat.blocs.length; compte.textContent = n ? n + ' bloc' + (n > 1 ? 's' : '') + ' sur la grille' : 'La grille est vide';
    arbre();
  }

  /* ---------- glisser : à la souris, au doigt, au stylet (pointer events) ---------- */
  var drag = null;
  function cellule(ev, w) {
    var r = grille.getBoundingClientRect(), cs = getComputedStyle(grille);
    var gap = parseFloat(cs.getPropertyValue('--ecart')) || 12, rang = parseFloat(cs.getPropertyValue('--rang')) || 72, c = cols();
    if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) return null;
    var colW = (r.width - gap * (c + 1)) / c;
    var cx = Math.floor((ev.clientX - r.left - gap / 2) / (colW + gap)), cy = Math.floor((ev.clientY - r.top - gap / 2) / (rang + gap));
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
    if (!drag.bouge) {
      drag.bouge = true;
      drag.fantome = document.createElement('div'); drag.fantome.className = 'fantome'; drag.fantome.textContent = drag.nom; document.body.appendChild(drag.fantome);
      if (drag.bloc) { var el = grille.querySelector('[data-uid="' + drag.bloc.uid + '"]'); if (el) el.classList.add('leve'); }
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
  function fin(ev) {
    if (!drag) return;
    var d = drag; drag = null;
    if (d.fantome) d.fantome.remove();
    aimant.hidden = true;
    if (!d.bouge) { if (!d.bloc) ajouter(d.type, d.ref); return; }   /* un simple toucher sur un fragment le pose à la première place libre */
    var dans = cellule(ev, d.w);
    if (!dans || !d.cible) { rendre(); return; }
    if (d.bloc) { d.bloc.x = d.cible.x; d.bloc.y = d.cible.y; rendre(); sauver(); }
    else ajouter(d.type, d.ref, d.cible.x, d.cible.y);
  }
  zoneFamilles.addEventListener('pointerdown', function (ev) {
    var f = ev.target.closest('.fragment'); if (!f) return;
    var g = groupes[f.getAttribute('data-g')];
    debut(ev, { type: 'groupe', ref: g.id, nom: g.nom, w: 3, h: 2 });
  });
  zoneFamilles.addEventListener('keydown', function (ev) {
    var f = ev.target.closest('.fragment'); if (f && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); ajouter('groupe', f.getAttribute('data-g')); }
  });
  grille.addEventListener('pointerdown', function (ev) {
    var p = ev.target.closest('.poignee'); if (!p) return;
    var el = p.parentNode, b = etat.blocs.filter(function (x) { return x.uid === el.getAttribute('data-uid'); })[0]; if (!b) return;
    var c = cellule(ev, b.w);
    debut(ev, { bloc: b, nom: b.type === 'brique' ? briques[b.ref].titre : groupes[b.ref].nom, w: b.w, h: b.h, decal: c ? Math.max(0, c.x - b.x) : 0, decalY: c ? Math.max(0, c.y - b.y) : 0 });
  });
  document.addEventListener('pointermove', bouger, { passive: false });
  document.addEventListener('pointerup', fin);
  document.addEventListener('pointercancel', function () { if (drag && drag.fantome) drag.fantome.remove(); drag = null; aimant.hidden = true; rendre(); });

  /* ---------- actions sur un bloc : taille, retirer, clavier ---------- */
  var TAILLES = [[3, 2], [6, 2], [4, 3], [6, 3], [12, 2]];
  function trouve(el) { var a = el.closest('.bloc'); return a && etat.blocs.filter(function (x) { return x.uid === a.getAttribute('data-uid'); })[0]; }
  grille.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-act]'); if (!btn) return;
    var b = trouve(btn); if (!b) return;
    if (btn.getAttribute('data-act') === 'retirer') etat.blocs = etat.blocs.filter(function (x) { return x !== b; });
    else {
      var i = TAILLES.findIndex(function (t) { return t[0] === b.w && t[1] === b.h; }), t = TAILLES[(i + 1) % TAILLES.length];
      b.w = t[0]; b.h = t[1]; var p = placer(b.x, b.y, b.w, b.h, b); b.x = p.x; b.y = p.y;
    }
    rendre(); sauver();
    var el = grille.querySelector('[data-uid="' + b.uid + '"]'); if (el) el.focus();
  });
  grille.addEventListener('keydown', function (ev) {
    var el = ev.target.closest('.bloc'); if (!el || ev.target !== el) return;
    var b = trouve(el); if (!b) return;
    var k = u(), dx = { ArrowLeft: -k, ArrowRight: k }[ev.key] || 0, dy = { ArrowUp: -1, ArrowDown: 1 }[ev.key] || 0;
    if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); etat.blocs = etat.blocs.filter(function (x) { return x !== b; }); rendre(); sauver(); return; }
    if (!dx && !dy) return;
    ev.preventDefault();
    var r = { x: Math.max(0, Math.min(12 - b.w, b.x + dx)), y: Math.max(0, b.y + dy), w: b.w, h: b.h };
    if (libre(r, b)) { b.x = r.x; b.y = r.y; rendre(); sauver(); }
    var n = grille.querySelector('[data-uid="' + b.uid + '"]'); if (n) n.focus();
  });

  /* ---------- l’achèvement ---------- */
  function composer() {
    etat.blocs = [];
    var liste = ACH.briques.slice();
    if (etat.inverse) {
      /* le moins tenté d’abord : les briques se posent dans cet ordre, chacune à la première place libre */
      liste.sort(function (a, b) { return a.tentatives - b.tentatives; });
      liste.forEach(function (br) { var p = placer(0, 0, br.w, br.h); etat.blocs.push({ uid: 'a' + br.id, type: 'brique', ref: br.id, x: p.x, y: p.y, w: br.w, h: br.h }); });
    } else {
      liste.forEach(function (br) { etat.blocs.push({ uid: 'a' + br.id, type: 'brique', ref: br.id, x: br.x, y: br.y, w: br.w, h: br.h }); });
    }
    rendre(); sauver();
  }
  var inv = document.getElementById('inverser');
  document.getElementById('composer').addEventListener('click', composer);
  inv.addEventListener('click', function () { etat.inverse = !etat.inverse; inv.setAttribute('aria-pressed', String(etat.inverse)); composer(); });
  document.getElementById('vider').addEventListener('click', function () { etat.blocs = []; rendre(); sauver(); });

  /* ---------- départ : la composition gardée, sinon l’achèvement ---------- */
  if (charger()) { inv.setAttribute('aria-pressed', String(!!etat.inverse)); rendre(); } else composer();
  var rafR = 0; window.addEventListener('resize', function () { cancelAnimationFrame(rafR); rafR = requestAnimationFrame(rendre); });
})();
