/* Le Cube du Jour J : le concept d’ATLAS appliqué à un mariage (un mariage d’exemple, data/mariage.js).
   Le même Cube que la vue Cube (js/vue-cube.js, A.vueCube.charger), six faces pour un mariage :
     Chronologie : le rétroplanning, puis le Jour J heure par heure ·  Composition : les grandes parties du mariage
     Archives : les documents (devis, contrats, playlist, plan de table) ·  Relations : ce qui dépend de quoi, et les plans B
     Modules : les modules d’ATLAS que le mariage appelle ·  Écosystème : les personnes, leur état, et ce qui manque
   Trois idées :
   - ce qui manque est trouvé, pas déclaré : contrat non signé, acompte, tâche en retard, plan B absent pour l’extérieur,
     personne attendue à deux endroits à la fois, régimes non renseignés, prestataire à relancer ;
   - chacun sa face : les mariés voient tout ; le DJ, le traiteur, la photographe, les témoins, les invités ne voient que ce qui les concerne ;
   - le Jour J heure par heure : on avance dans la journée, le Cube montre ce qui se passe, qui le fait vivre, et ce qui vient ensuite.
   Tout est relié par une raison écrite dans les données (qui fait quoi, quel document, quelle dépendance) ; rien n’est deviné. */
(function () {
  var A = window.ATLAS, M = A.mariage, B = A.bloc;
  if (!M || !A.vueCube) return;
  var esc = B.esc, fr = B.fr;
  var calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var VIS = {}; (A.visuels || []).forEach(function (v) { VIS[v.id] = v; });
  var MOD = {}; (A.modules || []).forEach(function (m) { MOD[m.id] = m; });
  var P = {}; M.personnes.forEach(function (p) { P[p.id] = p; });
  var J = {}; M.jourJ.forEach(function (m) { J[m.id] = m; });
  var D = {}; M.documents.forEach(function (d) { D[d.id] = d; });

  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var jour = function (iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var dateFr = function (iso) { var d = jour(iso); return (d.getDate() === 1 ? '1er' : d.getDate()) + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); };
  var euros = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €'; };
  /* la journée commence l’après-midi : 02:00 est après minuit, donc après 23:00 */
  var minutes = function (h) { var p = h.split(':'), m = +p[0] * 60 + +p[1]; return m < 12 * 60 ? m + 24 * 60 : m; };
  var heure = function (m) { m = m % (24 * 60); return Math.floor(m / 60) + ' h ' + ('0' + m % 60).slice(-2); };
  var aujourdhui = new Date(); aujourdhui.setHours(0, 0, 0, 0);
  var jJ = Math.round((jour(M.date) - aujourdhui) / 864e5);

  var ROLES = [
    { id: 'maries', nom: 'Les mariés' }, { id: 'coordination', nom: 'La coordination' }, { id: 'temoins', nom: 'Les témoins' },
    { id: 'dj', nom: 'Le DJ' }, { id: 'traiteur', nom: 'Le traiteur' }, { id: 'photographe', nom: 'La photographe' }, { id: 'invites', nom: 'Les invités' }
  ];
  var toutVoir = function (r) { return r === 'maries' || r === 'coordination'; };
  var noms = function (ids) { return ids.map(function (k) { return P[k] ? P[k].nom : k; }); };

  /* ---------- ce qui manque : trouvé dans les données, chacun avec sa raison et ce qu’il touche ---------- */
  function manques() {
    var l = [];
    var ajoute = function (id, titre, raison, touche, argent) { l.push({ id: id, titre: titre, raison: raison, touche: touche, argent: !!argent }); };
    M.documents.forEach(function (d) {
      if ((d.type === 'Contrat' || d.type === 'Devis') && d.signe === false) ajoute('x-signe-' + d.id, d.nom + ' : pas signé', 'Le document est un ' + d.type.toLowerCase() + ' et il n’est pas signé.', [d.id, d.de], true);
      if (d.acompte && !d.acompte.paye) {
        var retard = jour(d.acompte.avant) < aujourdhui;
        ajoute('x-acompte-' + d.id, 'Acompte de ' + euros(d.acompte.montant) + (retard ? ' en retard' : ' à payer'), (retard ? 'Il devait être payé avant le ' : 'À payer avant le ') + dateFr(d.acompte.avant) + ' (' + d.nom + ').', [d.id, d.de], true);
      }
    });
    M.retroplanning.forEach(function (r) {
      if (!r.fait && jour(r.date) < aujourdhui) ajoute('x-retard-' + r.id, 'En retard : ' + r.titre.charAt(0).toLowerCase() + r.titre.slice(1), 'Prévu pour le ' + dateFr(r.date) + ', pas encore fait.', [r.id].concat(r.qui));
    });
    var dehors = M.jourJ.filter(function (m) { return m.exterieur && !m.planB; });
    if (dehors.length) ajoute('x-planb', dehors.length + ' moment' + (dehors.length > 1 ? 's' : '') + ' en extérieur sans plan B', 'En cas de pluie, rien n’est prévu pour : ' + dehors.map(function (m) { return m.titre.toLowerCase() + ' (' + m.lieu + ', ' + heure(minutes(m.debut)) + ')'; }).join(', ') + '.', dehors.map(function (m) { return m.id; }));
    /* une personne attendue à deux endroits à la fois */
    M.personnes.forEach(function (p) {
      var ms = M.jourJ.filter(function (m) { return m.qui.indexOf(p.id) !== -1; });
      for (var i = 0; i < ms.length; i++) for (var k = i + 1; k < ms.length; k++) {
        var a = ms[i], b = ms[k];
        if (a.lieu !== b.lieu && minutes(a.debut) < minutes(b.fin) && minutes(b.debut) < minutes(a.fin))
          ajoute('x-double-' + p.id + '-' + b.id, p.nom + ' attendu' + (/^La |^Léa|^Inès|^Camille/.test(p.nom) ? 'e' : '') + ' à deux endroits', heure(Math.max(minutes(a.debut), minutes(b.debut))) + ' : ' + a.titre + ' (' + a.lieu + ') et ' + b.titre + ' (' + b.lieu + ').', [p.id, a.id, b.id]);
      }
    });
    /* une dépendance qui ne tient pas : un moment qui commence avant la fin de celui qu’il suit */
    M.jourJ.forEach(function (m) { var a = m.apres && J[m.apres]; if (a && minutes(m.debut) < minutes(a.fin)) ajoute('x-ordre-' + m.id, m.titre + ' commence trop tôt', m.titre + ' doit suivre ' + a.titre.toLowerCase() + ', qui finit à ' + heure(minutes(a.fin)) + '.', [m.id, a.id]); });
    var sans = M.invites.filter(function (i) { return !i.regime; });
    if (sans.length) ajoute('x-regimes', sans.length + ' invité' + (sans.length > 1 ? 's' : '') + ' sans régime renseigné', sans.map(function (i) { return i.nom + ' (table ' + i.table + ')'; }).join(', ') + ' : le traiteur en a besoin.', ['d-invites', 'traiteur']);
    M.personnes.forEach(function (p) { if (p.etat === 'relancer') ajoute('x-relancer-' + p.id, 'À relancer : ' + p.nom.charAt(0).toLowerCase() + p.nom.slice(1), 'Sa confirmation n’est pas encore arrivée.', [p.id]); });
    return l;
  }
  var MANQUES = manques();

  /* ---------- ce que chaque rôle voit ---------- */
  function vue(role) {
    var tout = toutVoir(role);
    var gens = function (m) { return m.qui.some(function (k) { return P[k] && P[k].role === role; }); };
    var moments = M.jourJ.filter(function (m) { return tout || gens(m) || (m.pour || []).indexOf(role) !== -1; });
    var retro = tout ? M.retroplanning : role === 'temoins' ? M.retroplanning.filter(function (r) { return r.qui.some(function (k) { return P[k] && P[k].role === 'temoins'; }); }) : [];
    var docs = M.documents.filter(function (d) { return d.visible.indexOf(role) !== -1; });
    var vus = {}; moments.concat(retro).forEach(function (m) { vus[m.id] = 1; m.qui.forEach(function (k) { vus[k] = 1; }); }); docs.forEach(function (d) { vus[d.id] = 1; });
    var personnes = M.personnes.filter(function (p) { return tout || role === 'invites' ? (tout || p.role === 'maries' || p.role === 'coordination') : vus[p.id] || p.role === 'coordination'; });
    personnes.forEach(function (p) { vus[p.id] = 1; });
    var mq = MANQUES.filter(function (x) { return tout || (!x.argent && role !== 'invites' && x.touche.some(function (k) { return vus[k] && (!P[k] || P[k].role === role || J[k] || D[k]); })); });
    var blocs = M.blocs.filter(function (b) { return tout || b.relie.some(function (k) { return vus[k]; }); });
    var modules = M.modules.filter(function (m) { return m.pour.indexOf(role) !== -1 && MOD[m.ref]; });
    return { moments: moments, retro: retro, docs: docs, personnes: personnes, manques: mq, blocs: blocs, modules: modules, vus: vus };
  }

  /* ---------- la source du Cube, pour un rôle ---------- */
  function source(role) {
    var V = vue(role), items = {}, liens = {};
    var item = function (id, o) { o.id = id; items[id] = o; liens[id] = liens[id] || {}; return o; };
    var lier = function (a, b) { if (!items[a] || !items[b] || a === b) return; liens[a][b] = 1; liens[b][a] = 1; };
    var fiche = function (lignes) { return '<dl class="mj-fiche">' + lignes.filter(function (l) { return l[1]; }).map(function (l) { return '<div><dt>' + esc(l[0]) + '</dt><dd>' + fr(l[1]) + '</dd></div>'; }).join('') + '</dl>'; };
    var ETAT = { confirme: 'En production', relancer: 'En développement' };

    var retro = V.retro.map(function (r) {
      var retard = !r.fait && jour(r.date) < aujourdhui;
      return item(r.id, { court: r.fait ? '✓' : 'J-' + Math.max(0, Math.round((jour(M.date) - jour(r.date)) / 864e5)), titre: r.titre, sous: dateFr(r.date) + (r.fait ? ' · fait' : retard ? ' · en retard' : ' · à faire'),
        date: dateFr(r.date), etat: r.fait ? 'En production' : retard ? 'Prototype' : '', texte: r.fait ? 'Fait.' : retard ? 'Prévu pour le ' + dateFr(r.date) + ' : en retard.' : 'À faire avant le ' + dateFr(r.date) + '.',
        fiche: [['Avec', noms(r.qui).join(', ')], ['État', r.fait ? 'fait' : retard ? 'en retard' : 'à faire']], detail: fiche([['Avec', noms(r.qui).join(', ')], ['Prévu le', dateFr(r.date)], ['Document', r.doc && D[r.doc] ? D[r.doc].nom : '']]) });
    });
    var moments = V.moments.map(function (m) {
      var v = VIS[m.visuel];
      return item(m.id, { court: m.debut.replace(':', ' h '), titre: m.titre, sous: 'Jour J · ' + heure(minutes(m.debut)) + ' – ' + heure(minutes(m.fin)) + ' · ' + m.lieu,
        date: heure(minutes(m.debut)) + ' – ' + heure(minutes(m.fin)), img: v ? { src: v.src, alt: v.alt } : null, texte: (m.planB ? 'Plan B (' + m.planB.si + ') : ' + m.planB.alors : '') ,
        fiche: [['Lieu', m.lieu], ['Avec', noms(m.qui).join(', ')], ['Plan B', m.planB ? m.planB.si + ' : ' + m.planB.alors : m.exterieur ? 'aucun, en extérieur' : '']],
        detail: fiche([['Horaire', heure(minutes(m.debut)) + ' – ' + heure(minutes(m.fin))], ['Lieu', m.lieu + (m.exterieur ? ' (extérieur)' : '')], ['Le font vivre', noms(m.qui).join(', ')], ['Après', m.apres && J[m.apres] ? J[m.apres].titre : ''], ['Plan B', m.planB ? 'si ' + m.planB.si + ' : ' + m.planB.alors : '']]) });
    });
    var docs = V.docs.map(function (d) {
      return item(d.id, { court: d.type.slice(0, 4), titre: d.nom, sous: d.type + (toutVoir(role) && d.montant ? ' · ' + euros(d.montant) : '') + (d.signe === false ? ' · pas signé' : ''), date: d.type,
        etat: d.signe === false || (d.acompte && !d.acompte.paye && jour(d.acompte.avant) < aujourdhui) ? 'Prototype' : '',
        fiche: [['De', P[d.de] ? P[d.de].nom : ''], ['Montant', toutVoir(role) && d.montant ? euros(d.montant) : ''], ['Signé', d.signe === undefined ? '' : d.signe ? 'oui' : 'non']],
        detail: fiche([['Type', d.type], ['De', P[d.de] ? P[d.de].nom : ''], ['Montant', toutVoir(role) && d.montant ? euros(d.montant) : ''], ['Acompte', toutVoir(role) && d.acompte ? euros(d.acompte.montant) + ' avant le ' + dateFr(d.acompte.avant) + (d.acompte.paye ? ', payé' : ', pas encore payé') : ''], ['Signé', d.signe === undefined ? '' : d.signe ? 'oui' : 'non']]) +
          '<p class="mj-note">Un exemple : le document lui-même n’est pas joint. Avec vos vrais fichiers, l’import d’ATLAS le lit, le date et le relie.</p>' });
    });
    var personnes = V.personnes.map(function (p) {
      var ses = M.jourJ.filter(function (m) { return m.qui.indexOf(p.id) !== -1; });
      return item(p.id, { court: p.nom.split(/[ ,]/)[0] === 'Le' || p.nom.split(/[ ,]/)[0] === 'La' ? p.nom.split(/[ ,]/)[1] : p.nom.split(/[ ,]/)[0], titre: p.nom, sous: (ROLES.filter(function (r) { return r.id === p.role; })[0] || { nom: p.role }).nom + ' · ' + (p.etat === 'confirme' ? 'confirmé' : 'à relancer'),
        date: p.etat === 'confirme' ? 'Confirmé' : 'À relancer', etat: ETAT[p.etat], fiche: [['Le Jour J', ses.map(function (m) { return heure(minutes(m.debut)) + ' ' + m.titre.toLowerCase(); }).join(', ')]],
        detail: fiche([['État', p.etat === 'confirme' ? 'confirmé' : 'à relancer'], ['Le Jour J', ses.map(function (m) { return heure(minutes(m.debut)) + ', ' + m.titre.toLowerCase(); }).join(' ; ')]]) });
    });
    var manque = V.manques.map(function (x) {
      return item(x.id, { court: '!', titre: x.titre, sous: 'Ce qui manque', date: 'À régler', etat: 'Prototype', texte: x.raison, fiche: [['Pourquoi', x.raison]], detail: '<p class="mj-raison">' + fr(x.raison) + '</p>' });
    });
    var relations = [];
    V.moments.forEach(function (m) {
      if (m.apres && J[m.apres] && items[m.apres]) relations.push(item('rel-' + m.id, { court: '→', titre: J[m.apres].titre + ' → ' + m.titre, sous: 'Dépendance · ' + m.titre + ' suit ' + J[m.apres].titre.toLowerCase(), date: 'Dépendance', texte: m.titre + ' commence à ' + heure(minutes(m.debut)) + ', après ' + J[m.apres].titre.toLowerCase() + ' (fin à ' + heure(minutes(J[m.apres].fin)) + ').', _bouts: [m.id, m.apres] }));
      if (m.planB) relations.push(item('planb-' + m.id, { court: 'B', titre: 'Plan B : ' + m.titre.toLowerCase(), sous: 'Si ' + m.planB.si + ' · ' + m.planB.alors, date: 'Plan B', texte: 'Si ' + m.planB.si + ' : ' + m.planB.alors, _bouts: [m.id] }));
    });
    var blocs = V.blocs.map(function (b) { return item(b.id, { court: b.titre.split(' ').pop(), titre: b.titre, sous: b.sous, date: 'Partie du mariage', texte: b.sous + '.' }); });
    var modules = V.modules.map(function (m) { var x = MOD[m.ref]; return item('m-' + m.ref, { court: x.titre, titre: x.titre, sous: 'Module d’ATLAS · ' + x.role, date: 'Module', texte: x.role }); });

    /* les liens : seulement ceux que les données écrivent */
    V.moments.concat(V.retro).forEach(function (m) { m.qui.forEach(function (k) { lier(m.id, k); }); if (m.doc) lier(m.id, m.doc); });
    V.docs.forEach(function (d) { lier(d.id, d.de); });
    relations.forEach(function (r) { r._bouts.forEach(function (k) { lier(r.id, k); }); });
    V.blocs.forEach(function (b) { b.relie.forEach(function (k) { lier(b.id, k); }); });
    V.modules.forEach(function (m) { m.relie.forEach(function (k) { lier('m-' + m.ref, k); }); });
    V.manques.forEach(function (x) { x.touche.forEach(function (k) { lier(x.id, k); }); });

    var visuel = function (id) { var v = VIS[id]; return v ? { src: v.src, alt: v.alt } : null; };
    var faces = [
      { id: 'avant', mot: 'Chronologie', sous: toutVoir(role) ? 'Le rétroplanning, puis le Jour J' : 'Votre Jour J, heure par heure', axe: 'temps', liste: retro.concat(moments), rx: 0, ry: 0, img: visuel('phare') },
      { id: 'droite', mot: 'Composition', sous: 'Les grandes parties du mariage', axe: 'structure', liste: blocs, rx: 0, ry: -90, img: visuel('collection-forets') },
      { id: 'arriere', mot: 'Archives', sous: 'Les documents', axe: 'temps', liste: docs, rx: 0, ry: -180, img: visuel('fondateur') },
      { id: 'gauche', mot: 'Relations', sous: 'Ce qui dépend de quoi, et les plans B', axe: 'structure', liste: relations, rx: 0, ry: -270, img: visuel('fils') },
      { id: 'haut', mot: 'Modules', sous: 'Les outils du mariage', axe: 'usage', liste: modules, rx: -90, ry: 0, img: visuel('saxophoniste') },
      { id: 'bas', mot: 'Écosystème', sous: 'Les personnes, et ce qui manque', axe: 'usage', liste: manque.concat(personnes), rx: 90, ry: 0, img: visuel('scene') }
    ];
    return { faces: faces, items: items, liens: liens, V: V, textes: { sansLien: 'Relié à rien dans les données de ce mariage.' } };
  }

  /* ---------- l’écran ---------- */
  var rolesEl = document.getElementById('mj-roles'), curseur = document.getElementById('mj-heure'), maintenant = document.getElementById('mj-maintenant');
  var derouler = document.getElementById('mj-derouler'), resume = document.getElementById('mj-resume'), compte = document.getElementById('mj-compte');
  var role = 'maries', courant = null;
  compte.textContent = JOURS[jour(M.date).getDay()] + ' ' + dateFr(M.date) + ' · ' + M.lieu + ' · ' + (jJ > 0 ? 'J-' + jJ : jJ === 0 ? 'c’est aujourd’hui' : 'il y a ' + (-jJ) + ' jours');
  rolesEl.innerHTML = ROLES.map(function (r) { return '<button type="button" class="mj-role" data-role="' + r.id + '" aria-pressed="' + (r.id === role) + '">' + esc(r.nom) + '</button>'; }).join('');

  var debut = Math.min.apply(null, M.jourJ.map(function (m) { return minutes(m.debut); })), fin = Math.max.apply(null, M.jourJ.map(function (m) { return minutes(m.fin); }));
  curseur.min = debut; curseur.max = fin; curseur.step = 15; curseur.value = debut;

  function charger() {
    courant = source(role);
    A.vueCube.charger(courant);
    var V = courant.V, r = ROLES.filter(function (x) { return x.id === role; })[0];
    resume.innerHTML = '<b>' + esc(r.nom) + '</b> : ' + V.moments.length + ' moment' + (V.moments.length > 1 ? 's' : '') + ' du Jour J' + (V.retro.length ? ', ' + V.retro.length + ' étapes avant' : '') + ', ' + V.docs.length + ' document' + (V.docs.length > 1 ? 's' : '') +
      (V.manques.length ? ', <span class="mj-manque">' + V.manques.length + ' chose' + (V.manques.length > 1 ? 's' : '') + ' à régler</span> (face Écosystème)' : ', rien à régler');
    montrerHeure(false);
  }
  /* le Jour J à une heure donnée : ce qui se passe, qui le fait vivre, et la suite */
  function montrerHeure(choisir) {
    var t = +curseur.value, V = courant.V;
    var en = V.moments.filter(function (m) { return minutes(m.debut) <= t && t < minutes(m.fin); });
    var suite = V.moments.filter(function (m) { return minutes(m.debut) > t; }).sort(function (a, b) { return minutes(a.debut) - minutes(b.debut); })[0];
    maintenant.innerHTML = '<b>' + heure(t) + '</b> · ' + (en.length ? en.map(function (m) { return esc(m.titre) + ' <small>(' + esc(m.lieu) + ')</small>'; }).join(' · ') : 'rien pour ' + esc(ROLES.filter(function (x) { return x.id === role; })[0].nom.toLowerCase()) + ' à cette heure') +
      (suite ? ' <span class="mj-suite">Ensuite : ' + esc(suite.titre) + ' à ' + heure(minutes(suite.debut)) + '</span>' : '');
    curseur.setAttribute('aria-valuetext', heure(t) + (en.length ? ', ' + en.map(function (m) { return m.titre; }).join(', ') : ''));
    if (choisir && en.length) { A.vueCube.vers('avant'); A.vueCube.choisir(en[0].id); }
  }
  rolesEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-role]'); if (!b) return;
    role = b.getAttribute('data-role');
    Array.prototype.forEach.call(rolesEl.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    arreter(); charger();
  });
  curseur.addEventListener('input', function () { arreter(); montrerHeure(true); });

  /* dérouler la journée : de moment en moment */
  var minuterie = 0;
  function arreter() { clearTimeout(minuterie); minuterie = 0; derouler.textContent = 'Dérouler la journée'; derouler.setAttribute('aria-pressed', 'false'); }
  derouler.addEventListener('click', function () {
    if (minuterie) { arreter(); return; }
    var etapes = courant.V.moments.map(function (m) { return minutes(m.debut); }).sort(function (a, b) { return a - b; }), i = 0;
    if (!etapes.length) return;
    derouler.textContent = 'Arrêter'; derouler.setAttribute('aria-pressed', 'true');
    (function pas() { curseur.value = etapes[i]; montrerHeure(true); i++; minuterie = i < etapes.length ? setTimeout(pas, calme ? 4000 : 2600) : 0; if (!minuterie) arreter(); })();
  });

  A.mariageCube = { source: source, manques: function () { return MANQUES; }, vue: vue, role: function () { return role; } };
  charger();
})();
