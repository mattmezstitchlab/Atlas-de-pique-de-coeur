/* La page d’une création publiée : /composition/<id> (et /creation?id=<id> hors Vercel).
   Elle lit creations/<id>.json, le vérifie (js/publication.js), puis l’affiche en lecture seule.
   Une création absente, invalide, privée ou non publiée est refusée, et rien n’en est affiché.
   Elle ne lit ni n’écrit le stockage local : votre propre composition n’est jamais touchée. */
(function () {
  var A = window.ATLAS, P = A.publication, B = A.bloc;
  var $ = function (id) { return document.getElementById(id); };
  var etat = $('creation-etat'), grille = $('creation-grille');
  /* la base (« / », ou « /atlas/ » sous lemondeaime.com) : les ancres de la page restent sur la page */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) { a.setAttribute('href', location.pathname + location.search + a.getAttribute('href')); });

  var m = /^(?:\/atlas)?\/composition\/([^/]+)\/?$/.exec(location.pathname), id = m ? decodeURIComponent(m[1]) : new URLSearchParams(location.search).get('id');
  function refuser(code, texte) {
    grille.innerHTML = ''; grille.hidden = true; $('creation-pied').hidden = true;
    $('creation-titre').textContent = 'Création introuvable';
    etat.textContent = texte; etat.setAttribute('data-code', code);
    document.title = 'Création introuvable — ATLAS';
  }
  if (!id || !P.ID.test(id)) return refuser('invalide', 'Cette adresse est invalide : un identifiant de création ne contient que des lettres minuscules, des chiffres et des tirets.');

  /* les références publiques, pour nommer les blocs */
  var base = function (n) { return n.replace(/\s*\(copy\)/gi, '').replace(/\s+copy$/i, '').trim(); };
  var groupes = {};
  A.applications.forEach(function (a) {
    var k = a[2] + '|' + base(a[1]), g = groupes[k] || (groupes[k] = { famille: a[2], nom: base(a[1]), n: 0, premier: a[0] });
    g.n++; if (a[0] < g.premier) g.premier = a[0];
  });
  var briques = {}; A.achevement.briques.forEach(function (b) { briques[b.id] = b; });
  var modules = {}; A.modules.forEach(function (x) { modules[x.id] = x; });
  var visuels = {}; A.visuels.forEach(function (v) { visuels[v.id] = v; });
  var nomDe = function (b) { return b.type === 'brique' ? briques[b.ref].titre : b.type === 'groupe' ? groupes[b.ref].nom : b.type === 'module' ? modules[b.ref].titre : b.type === 'fusion' ? b.parts.map(nomDe).join(' + ') : visuels[b.ref].legende; };
  var styleDe = function (b) { return b.style || (b.type === 'brique' ? briques[b.ref].style : b.type === 'visuel' ? (b.w >= 9 ? 'une' : 'section') : 'carte'); };
  function contenu(b) {
    if (b.type === 'fusion') return '<div class="fusion-panes" style="--n:' + b.parts.length + '">' + b.parts.map(function (x) { return '<div class="pane ' + x.type + ' ' + styleDe(x) + '">' + contenu(x) + '</div>'; }).join('<span class="couture" aria-hidden="true"></span>') + '</div>';
    var v = b.type === 'visuel' ? visuels[b.ref] : (b.visuel ? visuels[b.visuel] : null);
    var img = v ? '<img class="fond-bloc" src="' + B.esc(v.src) + '" alt="' + B.esc(v.alt) + '"' + (v.pos ? ' style="object-position:' + B.esc(v.pos) + '"' : '') + '>' : '';
    if (b.type === 'visuel') return img + '<div class="texte-visuel"><p class="sur">' + B.fr(v.accroche) + '</p><h4>' + B.fr(v.legende) + '</h4></div>';
    if (b.type === 'brique') return img + B.brique(briques[b.ref], true);
    if (b.type === 'groupe') return img + B.groupe(groupes[b.ref]);
    var md = modules[b.ref];
    return img + '<p class="sur">' + B.pastille(md.famille) + 'Module · ' + B.esc(B.nomFamille(md.famille)) + '</p><h4>' + B.fr(md.titre) + '</h4><p class="role">' + B.fr(md.role) + '</p>';
  }
  function afficher(pub) {
    document.title = pub.titre + ' — une création ATLAS';
    $('creation-titre').textContent = pub.titre;
    $('creation-description').textContent = pub.description || '';
    var h = pub.blocs.reduce(function (mx, b) { return Math.max(mx, b.y + b.h); }, 0);
    grille.style.gridTemplateRows = 'repeat(' + Math.max(h, 4) + ', var(--rang))';
    grille.innerHTML = pub.blocs.map(function (b) {
      var st = styleDe(b), surface = b.w * b.h, taille = surface >= 18 ? ' grand' : surface >= 9 ? ' moyen' : ' petit';
      var ints = b.intentions ? '<p class="meta">Intention · ' + b.intentions.map(B.esc).join(', ') + '</p>' : '';
      return '<article class="bloc ' + b.type + ' ' + st + taille + '" style="grid-column:' + (b.x + 1) + ' / span ' + b.w + ';grid-row:' + (b.y + 1) + ' / span ' + b.h + '" aria-label="' + B.esc(nomDe(b)) + ', colonne ' + (b.x + 1) + ', rangée ' + (b.y + 1) + '">' + contenu(b) + ints + '</article>';
    }).join('');
    var tous = {}; pub.blocs.forEach(function (b) { tous[b.uid] = b; (b.parts || []).forEach(function (x) { tous[x.uid] = x; }); });
    $('creation-liens').innerHTML = pub.liens.length ? pub.liens.map(function (l) { return '<li>' + B.fr(nomDe(tous[l[0]])) + ' → ' + B.fr(nomDe(tous[l[1]])) + '</li>'; }).join('') : '<li>Aucun lien.</li>';
    $('creation-date').textContent = B.date(pub.publieLe);
    $('creation-adresse').textContent = location.origin + (/^\/atlas(\/|$)/.test(location.pathname) ? '/atlas' : '') + '/composition/' + pub.id;
    $('creation-reference').textContent = JSON.stringify({ format: 'atlas-reference', version: 1, type: 'composition', id: pub.id });
    $('creation-pied').hidden = false;
    etat.textContent = pub.blocs.length + ' bloc' + (pub.blocs.length > 1 ? 's' : '') + ', ' + pub.liens.length + ' lien' + (pub.liens.length > 1 ? 's' : '') + ' · en lecture seule.';
    etat.setAttribute('data-code', 'ok');
  }
  fetch('creations/' + id + '.json', { cache: 'no-cache' }).then(function (r) {
    if (r.status === 404) throw { code: 'absente', texte: 'Cette création est absente : aucune création publiée ne porte l’identifiant « ' + id + ' ».' };
    if (!r.ok) throw { code: 'indisponible', texte: 'La création n’a pas pu être lue (erreur ' + r.status + '). Réessayez plus tard.' };
    return r.json().catch(function () { throw { code: 'invalide', texte: 'Ce fichier n’est pas une création ATLAS lisible.' }; });
  }).then(function (pub) {
    var v = P.valider(pub, id);
    if (!v.ok) {
      var mots = { privee: 'Cette création est privée : elle ne peut pas être ouverte ici.', 'non-publiee': 'Cette création n’est pas publiée : elle ne peut pas être ouverte ici.' };
      return refuser(v.code, mots[v.code] || ('Cette création est invalide. ' + v.raison));
    }
    afficher(pub);
  }).catch(function (e) { refuser(e && e.code || 'indisponible', e && e.texte || 'La création n’a pas pu être lue. Réessayez plus tard.'); });
})();
