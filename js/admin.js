/* L’éditeur de la chronologie (admin.html). Local : tout reste dans ce navigateur (localStorage + coffre IndexedDB).
   Publier = enregistrer une version ; exporter = produire data/chronologie.js (public, filtré) et un corpus LIFEBOOK (privé).
   Aucune fausse connexion : il n’y a ni serveur ni authentification tant que docs/ADMINISTRATION.md n’est pas réalisé. */
(function () {
  var A = window.ATLAS, CLE = 'atlas-admin-v1';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var copie = function (o) { return JSON.parse(JSON.stringify(o)); };
  var maintenant = function () { return new Date().toISOString(); };
  var jour = function () { return maintenant().slice(0, 10); };
  var nouvelId = function (p) { return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); };
  var vue = document.getElementById('vue'), etatEl = document.getElementById('etat');

  var PRECISIONS = { exacte: 'Date exacte', mois: 'Mois', annee: 'Année', periode: 'Période', approx: 'Approximative (déduite)', inconnue: 'Inconnue' };
  var PREUVES = { document: 'Établi par document', declare: 'Déclaré par l’auteur', 'a-verifier': 'À vérifier' };
  var STATUTS = { brouillon: 'Brouillon', publie: 'Publié', archive: 'Retiré' };
  var MODELES = { papier: 'Papier, une feuille d’époque', magazine: 'Magazine, la grande année', televiseur: 'Téléviseur, pour une vidéo', archive: 'Archive, les pièces', duo: 'Duo, hier et aujourd’hui', lacune: 'Lacune, les années à documenter', bandeau: 'Bandeau, bord à bord' };
  var FONDS = { '': 'Celui du modèle', carte: 'Carte blanche', sombre: 'Sombre' };
  var CADRAGES = { '': 'Centre', top: 'Haut', bottom: 'Bas', left: 'Gauche', right: 'Droite' };
  var TYPES = { oeuvre: 'Œuvre', photo: 'Photographie', affiche: 'Affiche', diplome: 'Diplôme ou attestation', video: 'Vidéo', dessin: 'Dessin ou croquis', document: 'Document de recherche', musique: 'Musique', objet: 'Objet', prototype: 'Prototype', publication: 'Publication', fin: 'Projet de fin d’études' };
  var PRIVES = { prive: 'Privé : dans mes archives, jamais public', publiable: 'Publiable : vérifié et autorisé', publie: 'Publié : visible dans la chronologie' };
  var NATURES = { devenu: 'Est devenu', eclaire: 'Éclaire', suite: 'A pour suite', prolonge: 'Prolonge' };

  /* ---------- l’état local ---------- */
  function semence() {
    var d = copie(A.chronologie);
    /* les pièces privées : connues de l’éditeur, jamais du fichier public */
    d.archives.push(
      { id: 'a-diplome', mediaType: 'diplome', title: 'Diplôme de Saint-Luc Tournai', originalDate: '2005', author: '', source: 'Archives de l’auteur', usageRights: 'privé', privacy: 'prive', storageRef: '', thumbnailRef: '', relatedEntryIds: [] },
      { id: 'a-bulletins-secondaire', mediaType: 'document', title: 'Documents scolaires du secondaire (intitulé de la formation)', originalDate: '1999–2002', author: '', source: 'Archives de l’auteur', usageRights: 'privé', privacy: 'prive', storageRef: '', thumbnailRef: '', relatedEntryIds: [] });
    d.entrees.forEach(function (e) {
      if (e.id === 'e-2005-sortie') e.archiveIds = ['a-diplome'];
      if (e.id === 'e-saint-luc-secondaire') { e.archiveIds = ['a-bulletins-secondaire']; e.lifebookRef = 'evt_saint-luc'; }
      if (e.id === 'e-saint-luc-superieur') e.lifebookRef = 'evt_saint-luc';
    });
    return { schemaVersion: 1, donnees: d, versions: [{ n: 1, quand: d.publieLe + 'T00:00:00.000Z', note: 'Version publiée dans le dépôt, avec ses pièces privées', donnees: copie(d) }], journal: [{ quand: maintenant(), quoi: 'Éditeur ouvert pour la première fois : départ depuis la version publiée (version 1).' }], choix: d.entrees[0] && d.entrees[0].id };
  }
  var S;
  try { S = JSON.parse(localStorage.getItem(CLE) || 'null'); } catch (e) { S = null; }
  if (!S || !S.donnees) S = semence();
  var onglet = 'entrees', archiveChoisie = null, attente = 0;
  function noter(quoi) { S.journal.unshift({ quand: maintenant(), quoi: quoi }); S.journal = S.journal.slice(0, 300); }
  function sauver(quoi) {
    if (quoi) noter(quoi);
    try { localStorage.setItem(CLE, JSON.stringify(S)); etatEl.textContent = 'Enregistré dans ce navigateur à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '.'; }
    catch (e) { etatEl.textContent = 'Impossible d’enregistrer : l’espace du navigateur est plein ou indisponible.'; }
  }
  var D = function () { return S.donnees; };
  var entree = function (id) { return D().entrees.filter(function (e) { return e.id === id; })[0]; };
  var archive = function (id) { return D().archives.filter(function (a) { return a.id === id; })[0]; };

  /* ---------- les champs ---------- */
  var options = function (o, v) { return Object.keys(o).map(function (k) { return '<option value="' + esc(k) + '"' + (k === (v || '') ? ' selected' : '') + '>' + esc(o[k]) + '</option>'; }).join(''); };
  var champ = function (lab, html, aide) { return '<label class="champ-admin"><span>' + esc(lab) + '</span>' + html + (aide ? '<small>' + aide + '</small>' : '') + '</label>'; };
  var texte = function (nom, v, ph) { return '<input class="champ" data-c="' + nom + '" value="' + esc(v) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '>'; };
  var zone = function (nom, v, n) { return '<textarea class="champ zone" data-c="' + nom + '" rows="' + (n || 4) + '">' + esc(v) + '</textarea>'; };
  var choix = function (nom, o, v) { return '<select class="champ" data-c="' + nom + '">' + options(o, v) + '</select>'; };

  /* ---------- les événements ---------- */
  function vueEntrees() {
    var e = entree(S.choix) || D().entrees[0]; if (e) S.choix = e.id;
    var liste = '<ol class="liste-admin">' + D().entrees.map(function (x, i) {
      return '<li class="' + (x.id === S.choix ? 'actif' : '') + '"><button type="button" class="ligne" data-choisir="' + esc(x.id) + '"><span class="an">' + esc(A.chrono.quand(x)) + '</span><b>' + esc(x.title || 'Sans titre') + '</b><i class="statut ' + esc(x.publicationStatus) + '">' + esc(STATUTS[x.publicationStatus]) + '</i></button>' +
        '<span class="ordre"><button type="button" data-monter="' + i + '" aria-label="Monter ' + esc(x.title) + '"' + (i ? '' : ' disabled') + '>↑</button><button type="button" data-descendre="' + i + '" aria-label="Descendre ' + esc(x.title) + '"' + (i < D().entrees.length - 1 ? '' : ' disabled') + '>↓</button></span></li>';
    }).join('') + '</ol><button type="button" class="bouton noir" data-ajouter-entree>Ajouter un événement</button>';
    var form = e ? formEntree(e) : '<p>Aucun événement.</p>';
    vue.innerHTML = '<div class="deux-col"><aside class="col-liste" aria-label="Les événements, dans l’ordre de la page">' + liste + '</aside><div class="col-form">' + form + '</div></div>';
    apercuEntree(e);
  }
  function formEntree(e) {
    var vis = (A.visuels || []), vid = A.chrono.youtube(e.video);
    return '<form class="form-admin" data-entree="' + esc(e.id) + '" onsubmit="return false">' +
      '<div class="grille-champs">' + champ('Titre', texte('title', e.title)) + champ('Statut', choix('publicationStatus', STATUTS, e.publicationStatus), 'Un brouillon ne part jamais dans le fichier public.') +
      champ('Début', texte('dateStart', e.dateStart, 'AAAA ou AAAA-MM ou AAAA-MM-JJ')) + champ('Fin', texte('dateEnd', e.dateEnd, 'facultatif')) +
      champ('Précision de la date', choix('datePrecision', PRECISIONS, e.datePrecision), 'Approximative : années déduites d’une durée.') + champ('Preuve', choix('evidenceStatus', PREUVES, e.evidenceStatus)) +
      champ('Formation', choix('educationPeriod', { '': 'Aucune', secondaire: 'Secondaire', superieur: 'Supérieur' }, e.educationPeriod)) + champ('Visibilité', choix('visibility', { public: 'Public', prive: 'Privé' }, e.visibility)) + '</div>' +
      champ('Récit', zone('narrative', e.narrative, 5)) +
      champ('Contexte ou lecture (facultatif)', zone(e.lecture != null ? 'lecture' : 'contexte', e.lecture != null ? e.lecture : (e.contexte || ''), 2), 'Signalé comme une lecture, distincte des faits.') +
      '<fieldset class="bloc-admin"><legend>Présentation</legend><div class="grille-champs">' +
      champ('Modèle', choix('layoutVariant', MODELES, e.layoutVariant)) + champ('Fond', choix('fond', FONDS, e.fond)) +
      champ('Grand visuel', '<select class="champ" data-c="bandeau"><option value="">Aucun</option>' + vis.map(function (v) { return '<option value="' + esc(v.id) + '"' + (v.id === e.bandeau ? ' selected' : '') + '>' + esc(v.accroche + ' · ' + v.legende) + '</option>'; }).join('') + '</select>', 'Pour le modèle Bandeau.') +
      champ('Cadrage du visuel', choix('cadrage', CADRAGES, e.cadrage)) + '</div>' +
      champ('Vidéo ou lien YouTube', texte('video', e.video, 'https://www.youtube.com/watch?v=…'), e.video ? (vid ? 'Vidéo reconnue : ' + esc(vid) + '. Si l’intégration est bloquée, le lien s’ouvre dans un nouvel onglet.' : 'Ce lien n’est pas reconnu comme une vidéo YouTube.') : '') + '</fieldset>' +
      '<fieldset class="bloc-admin"><legend>Personnes</legend><div id="personnes">' + (e.people || []).map(function (p, i) {
        return '<div class="personne-admin" data-p="' + i + '"><div class="grille-champs">' + champ('Nom', '<input class="champ" data-p-c="nom" value="' + esc(p.nom) + '">') + champ('Rôle', '<input class="champ" data-p-c="role" value="' + esc(p.role) + '">') + '</div>' +
          champ('Note', '<textarea class="champ zone" rows="2" data-p-c="note">' + esc(p.note) + '</textarea>') + champ('Sources (une adresse par ligne)', '<textarea class="champ zone" rows="2" data-p-c="sources">' + esc((p.sources || []).join('\n')) + '</textarea>') +
          '<button type="button" class="lien-retirer" data-retirer-personne="' + i + '">Retirer cette personne</button></div>';
      }).join('') + '</div><button type="button" class="bouton" data-ajouter-personne>Ajouter une personne</button></fieldset>' +
      '<fieldset class="bloc-admin"><legend>Archives liées</legend>' + (D().archives.length ? '<ul class="cases-admin">' + D().archives.map(function (a) {
        return '<li><label><input type="checkbox" data-archive-liee="' + esc(a.id) + '"' + ((e.archiveIds || []).indexOf(a.id) !== -1 ? ' checked' : '') + '> ' + esc(a.title) + ' <i class="statut ' + esc(a.privacy) + '">' + esc(a.privacy === 'prive' ? 'Privé' : a.privacy === 'publiable' ? 'Publiable' : 'Publié') + '</i></label></li>'; }).join('') + '</ul>' : '<p>Aucune archive. Ajoutez-en dans l’onglet Archives.</p>') +
      '<small>Une même archive peut appartenir à plusieurs événements : elle n’est jamais dupliquée.</small></fieldset>' +
      '<fieldset class="bloc-admin"><legend>LIFEBOOK</legend>' + champ('Référence LIFEBOOK (identifiant d’événement)', texte('lifebookRef', e.lifebookRef, 'evt_…'), 'Privée : elle ne part jamais dans le fichier public. Exemple existant dans LIFEBOOK : <code>evt_saint-luc</code>.') + '</fieldset>' +
      '<div class="actions-admin"><button type="button" class="bouton" data-apercu-ici>Prévisualiser sur la page d’accueil</button><button type="button" class="lien-retirer" data-supprimer-entree>Supprimer cet événement</button></div>' +
      '</form><section class="apercu-admin" aria-label="La composition, telle qu’elle paraîtra"><p class="surtitre">La composition, en direct</p><div class="avant apercu-zone" id="apercu-entree"></div></section>';
  }
  function apercuEntree(e) {
    var z = document.getElementById('apercu-entree'); if (!z || !e) return;
    var medias = {}, ids = (e.archiveIds || []);
    Promise.all(ids.map(function (id) { return A.coffre.lire(id).then(function (d) { if (d) medias[id] = d; }); })).then(function () {
      var d = { titre: '', chapeau: '', entrees: [Object.assign({}, e, { publicationStatus: 'publie', visibility: 'public' })], archives: D().archives, relations: D().relations };
      A.chrono.rendre(d, z, { medias: medias });
      var t = z.querySelector('.avant-tete'); if (t) t.remove(); var n = z.querySelector('.niveaux'); if (n) n.remove();
    });
  }

  /* ---------- les archives ---------- */
  function vueArchives() {
    var a = archive(archiveChoisie) || D().archives[0]; if (a) archiveChoisie = a.id;
    vue.innerHTML = '<div class="deux-col"><aside class="col-liste" aria-label="La bibliothèque d’archives"><ol class="liste-admin">' + D().archives.map(function (x) {
      return '<li class="' + (x.id === archiveChoisie ? 'actif' : '') + '"><button type="button" class="ligne" data-choisir-archive="' + esc(x.id) + '"><span class="an">' + esc(TYPES[x.mediaType] || x.mediaType) + ' · ' + esc(x.originalDate) + '</span><b>' + esc(x.title) + '</b><i class="statut ' + esc(x.privacy) + '">' + esc(x.privacy) + '</i></button></li>';
    }).join('') + '</ol><button type="button" class="bouton noir" data-ajouter-archive>Ajouter une archive</button></aside><div class="col-form">' + (a ? formArchive(a) : '<p>La bibliothèque est vide.</p>') + '</div></div>';
    if (a) A.coffre.lire(a.id).then(function (d) { var im = document.getElementById('vignette-archive'); if (im && (d || a.storageRef)) { im.src = d || a.storageRef; im.hidden = false; } });
  }
  function formArchive(a) {
    var liees = D().entrees.filter(function (e) { return (e.archiveIds || []).indexOf(a.id) !== -1; });
    return '<form class="form-admin" data-archive="' + esc(a.id) + '" onsubmit="return false">' +
      '<div class="grille-champs">' + champ('Titre', texte('title', a.title)) + champ('Type', choix('mediaType', TYPES, a.mediaType)) +
      champ('Date d’origine', texte('originalDate', a.originalDate)) + champ('Auteur', texte('author', a.author)) +
      champ('Source', texte('source', a.source)) + champ('Droits d’usage', texte('usageRights', a.usageRights)) + '</div>' +
      champ('Confidentialité', choix('privacy', PRIVES, a.privacy), 'Un diplôme peut prouver une date sans être publié : laissez-le privé.') +
      '<fieldset class="bloc-admin"><legend>Fichier</legend><img id="vignette-archive" class="vignette-admin" alt="' + esc(a.title) + '" hidden>' +
      champ('Déposer une image (elle reste sur cet appareil)', '<input type="file" accept="image/*" data-fichier-archive>') +
      champ('Chemin public, une fois le fichier déposé dans le dépôt', texte('storageRef', a.storageRef, 'media/archives/…jpg'), 'Seules les archives « publiées » avec un chemin paraissent au public.') + '</fieldset>' +
      '<p>Liée à : ' + (liees.length ? liees.map(function (e) { return '« ' + esc(e.title) + ' »'; }).join(', ') : 'aucun événement') + '. Les liens se cochent depuis chaque événement.</p>' +
      '<div class="actions-admin"><button type="button" class="lien-retirer" data-supprimer-archive>Supprimer cette archive</button></div></form>';
  }

  /* ---------- les relations ---------- */
  function vueRelations() {
    var cibles = D().entrees.map(function (e) { return [e.id, A.chrono.quand(e) + ' · ' + e.title]; })
      .concat((A.histoire.chapitres || []).map(function (c) { return ['chapitre:' + c.id, c.date + ' · ' + c.titre]; }), [['page:metamorphose', 'Octobre 2026 · La Métamorphose']]);
    var nom = function (v) { var c = cibles.filter(function (x) { return x[0] === v; })[0]; return c ? c[1] : v; };
    vue.innerHTML = '<p class="intro-admin">L’axe des relations : chaque lien dit pourquoi deux moments se répondent. Sans justification, il n’est pas enregistré.</p>' +
      '<ol class="relations-admin">' + D().relations.map(function (r, i) {
        return '<li><b>' + esc(nom(r.de)) + '</b> <span class="nature">' + esc(NATURES[r.nature] || r.nature) + '</span> <b>' + esc(nom(r.vers)) + '</b><p>' + esc(r.justification) + '</p><small>' + (r.auteur === 'document' ? 'Établi par document' : 'Lecture de l’auteur') + '</small> <button type="button" class="lien-retirer" data-retirer-relation="' + i + '">Retirer</button></li>';
      }).join('') + '</ol>' +
      '<form class="form-admin" id="nouvelle-relation" onsubmit="return false"><fieldset class="bloc-admin"><legend>Relier deux événements</legend><div class="grille-champs">' +
      champ('De', '<select class="champ" name="de">' + D().entrees.map(function (e) { return '<option value="' + esc(e.id) + '">' + esc(nom(e.id)) + '</option>'; }).join('') + '</select>') +
      champ('Nature', '<select class="champ" name="nature">' + options(NATURES, 'devenu') + '</select>') +
      champ('Vers', '<select class="champ" name="vers">' + cibles.map(function (c) { return '<option value="' + esc(c[0]) + '">' + esc(c[1]) + '</option>'; }).join('') + '</select>') +
      champ('Fondement', '<select class="champ" name="auteur">' + options({ declare: 'Lecture de l’auteur', document: 'Établi par document' }, 'declare') + '</select>') + '</div>' +
      champ('Justification', '<textarea class="champ zone" name="justification" rows="3" required></textarea>', 'Dites ce que l’on voit, pas ce que l’on suppose.') +
      '<button type="button" class="bouton noir" data-ajouter-relation>Ajouter la relation</button></fieldset></form>';
  }

  /* ---------- versions et journal ---------- */
  function vueVersions() {
    vue.innerHTML = '<div class="deux-col"><section><h2 class="titre">Versions publiées</h2><ol class="versions-admin">' + S.versions.slice().reverse().map(function (v) {
      return '<li><b>Version ' + v.n + '</b><span>' + esc(new Date(v.quand).toLocaleString('fr-FR')) + '</span><p>' + esc(v.note) + ' · ' + v.donnees.entrees.length + ' événements</p>' +
        '<button type="button" class="bouton" data-restaurer="' + v.n + '">Revenir à cette version</button> <button type="button" class="bouton" data-exporter-version="' + v.n + '">Exporter son fichier public</button></li>';
    }).join('') + '</ol></section><section><h2 class="titre">Journal des modifications</h2><ol class="journal-admin">' + S.journal.map(function (j) {
      return '<li><time>' + esc(new Date(j.quand).toLocaleString('fr-FR')) + '</time> ' + esc(j.quoi) + '</li>';
    }).join('') + '</ol></section></div>';
  }

  /* ---------- LIFEBOOK ---------- */
  function vueLifebook() {
    var refs = D().entrees.filter(function (e) { return e.lifebookRef; });
    vue.innerHTML = '<div class="lifebook-admin"><p class="intro-admin"><b>ATLAS raconte ce que vous avez créé. LIFEBOOK raconte ce que vous avez vécu.</b> Un même événement appartient aux deux récits sans être copié : l’atlas garde une référence vers l’identifiant LIFEBOOK.</p>' +
      '<ul class="faits-admin"><li>LIFEBOOK (dépôt <code>aime-lifebook</code>) est un atelier statique : ses données vivent dans le navigateur (IndexedDB), sans serveur ; son adaptateur serveur est prévu, non branché.</li>' +
      '<li>Il importe des lots au format <code>aime-lifebook-corpus</code> version 1, privés par défaut, par la vue Archives → « Intégrer un corpus », avec aperçu et confirmation.</li>' +
      '<li>Un identifiant déjà présent y est conservé tel quel : l’atlas ne réécrit jamais un événement de LIFEBOOK ; il lui ajoute des sources par des liens.</li>' +
      '<li>LIFEBOOK contient déjà <code>evt_saint-luc</code> (« Études à Saint-Luc », date inconnue).</li></ul>' +
      '<h2 class="titre">Références préparées</h2>' + (refs.length ? '<ul class="cases-admin">' + refs.map(function (e) { return '<li><b>' + esc(e.title) + '</b> → <code>' + esc(e.lifebookRef) + '</code></li>'; }).join('') + '</ul>' : '<p>Aucune. Ajoutez une référence depuis un événement.</p>') +
      '<button type="button" class="bouton noir" data-exporter-lifebook>Exporter un corpus LIFEBOOK (privé)</button><p class="note-source">Le fichier est téléchargé sur cet appareil. Pour l’intégrer : le déposer dans <code>corpus/&lt;id&gt;/corpus.json</code> du dépôt LIFEBOOK, par une pull request, puis « Intégrer un corpus ».</p></div>';
  }

  function corpusLifebook() {
    var dt = { exacte: 'exact', mois: 'month', annee: 'year', periode: 'period', approx: 'period', inconnue: 'unknown' };
    var cert = { document: 'etabli', declare: 'declare', 'a-verifier': 'aconfirmer' };
    var ev = [], sources = [], liens = [];
    D().entrees.forEach(function (e) {
      var srcIds = (e.archiveIds || []).map(function (id) { return 'src_atlas_' + id; });
      (e.archiveIds || []).forEach(function (id) { var a = archive(id); if (a && !sources.some(function (s) { return s.id === 'src_atlas_' + id; })) sources.push({ id: 'src_atlas_' + id, title: a.title, type: a.mediaType === 'photo' ? 'Photographie' : 'Document', date: a.originalDate, origin: 'Atlas de pique de cœur · ' + (a.source || ''), description: TYPES[a.mediaType] || '', reliability: e.evidenceStatus === 'document' ? 'authentique' : 'declaratif' }); });
      if (e.lifebookRef) { if (srcIds.length) { var l = liens.filter(function (x) { return x.id === e.lifebookRef; })[0]; if (l) srcIds.forEach(function (s) { if (l.add.indexOf(s) === -1) l.add.push(s); }); else liens.push({ coll: 'events', id: e.lifebookRef, field: 'sourceIds', add: srcIds }); } return; }
      ev.push({ id: 'evt_atlas_' + e.id, title: e.title, dateType: dt[e.datePrecision] || 'unknown', start: e.dateStart || '', end: e.dateEnd || '', approx: e.datePrecision === 'approx',
        description: e.narrative, category: e.educationPeriod ? 'Formation' : 'Projet', certainty: cert[e.evidenceStatus] || 'incertain', personIds: [], sourceIds: srcIds });
    });
    return { format: 'aime-lifebook-corpus', formatVersion: 1, id: 'corpus-atlas-' + jour(), title: 'Atlas de pique de cœur : la chronologie des créations', compiledBy: 'Atlas de pique de cœur (éditeur local)', compiledAt: jour(),
      provenance: 'Exporté depuis l’éditeur de l’atlas. Dates et preuves telles qu’indiquées dans l’atlas ; les fichiers des archives ne sont pas inclus.', visibility: 'privé',
      items: { people: [], sources: sources, conversations: [], excerpts: [], summaries: [], events: ev, notes: [], chapters: [], links: liens } };
  }

  /* ---------- le fichier public : seulement ce qui est publié ---------- */
  function publique(d) {
    var pub = d.entrees.filter(function (e) { return e.publicationStatus === 'publie' && e.visibility === 'public'; });
    var arch = d.archives.filter(function (a) { return a.privacy === 'publie'; }).map(function (a) {
      var x = copie(a); x.relatedEntryIds = pub.filter(function (e) { return (e.archiveIds || []).indexOf(a.id) !== -1; }).map(function (e) { return e.id; });
      if (/^data:/.test(x.storageRef)) x.storageRef = ''; if (!x.storageRef) x.attente = true; else delete x.attente; return x;
    });
    var aIds = arch.map(function (a) { return a.id; }), eIds = pub.map(function (e) { return e.id; });
    var entrees = pub.map(function (e) { var x = copie(e); delete x.lifebookRef; x.archiveIds = (x.archiveIds || []).filter(function (id) { return aIds.indexOf(id) !== -1; }); x.relatedEntryIds = (x.relatedEntryIds || []).filter(function (id) { return eIds.indexOf(id) !== -1; }); return x; });
    var rel = d.relations.filter(function (r) { return eIds.indexOf(r.de) !== -1 && (r.vers.indexOf(':') !== -1 || eIds.indexOf(r.vers) !== -1); });
    return { format: 'atlas-chronologie', schemaVersion: 1, publieLe: jour(), version: S.versions.length, titre: d.titre, chapeau: d.chapeau, entrees: entrees, archives: arch, relations: rel };
  }
  function fichierPublic(d) {
    return '/* La chronologie publiée : produite par l’éditeur (admin.html), version ' + d.version + ' du ' + d.publieLe + '.\n   Ce fichier est PUBLIC : seules les entrées et archives publiées y figurent. Le schéma est décrit dans docs/ADMINISTRATION.md. */\nwindow.ATLAS = window.ATLAS || {};\nwindow.ATLAS.chronologie = ' + JSON.stringify(d, null, 2) + ';\n';
  }
  function telecharger(nom, contenu, type) {
    var url = URL.createObjectURL(new Blob([contenu], { type: type || 'text/plain' })), a = document.createElement('a');
    a.href = url; a.download = nom; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /* ---------- rendre et écouter ---------- */
  function rendre() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-onglet]'), function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-onglet') === onglet)); b.setAttribute('aria-pressed', String(b.getAttribute('data-onglet') === onglet)); });
    ({ entrees: vueEntrees, archives: vueArchives, relations: vueRelations, versions: vueVersions, lifebook: vueLifebook })[onglet]();
  }
  document.querySelector('.onglets').addEventListener('click', function (ev) { var b = ev.target.closest('[data-onglet]'); if (b) { onglet = b.getAttribute('data-onglet'); rendre(); } });

  vue.addEventListener('input', function (ev) {
    var f = ev.target.closest('form'); if (!f) return;
    var c = ev.target.getAttribute('data-c'), pc = ev.target.getAttribute('data-p-c');
    if (f.hasAttribute('data-entree')) {
      var e = entree(f.getAttribute('data-entree'));
      if (c) e[c] = ev.target.value;
      if (pc) { var i = +ev.target.closest('[data-p]').getAttribute('data-p'); e.people[i][pc] = pc === 'sources' ? ev.target.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean) : ev.target.value; }
      e.updatedAt = jour();
      clearTimeout(attente); attente = setTimeout(function () { sauver('« ' + e.title + ' » modifié (' + (c || 'personne') + ').'); apercuEntree(e);
        var l = vue.querySelector('[data-choisir="' + e.id + '"]'); if (l) { l.querySelector('b').textContent = e.title || 'Sans titre'; l.querySelector('.an').textContent = A.chrono.quand(e); var st = l.querySelector('.statut'); st.className = 'statut ' + e.publicationStatus; st.textContent = STATUTS[e.publicationStatus]; } }, 350);
    } else if (f.hasAttribute('data-archive') && c) {
      var a = archive(f.getAttribute('data-archive')); a[c] = ev.target.value;
      clearTimeout(attente); attente = setTimeout(function () { sauver('Archive « ' + a.title + ' » modifiée (' + c + ').'); }, 350);
    }
  });
  vue.addEventListener('change', function (ev) {
    var t = ev.target, f = t.closest('form'); if (!f) return;
    if (t.matches('select[data-c]') && f.hasAttribute('data-entree')) { rendre(); return; }
    if (t.matches('select[data-c]') && f.hasAttribute('data-archive')) { sauver(); rendre(); return; }
    if (t.hasAttribute('data-archive-liee')) {
      var e = entree(f.getAttribute('data-entree')), id = t.getAttribute('data-archive-liee'); e.archiveIds = e.archiveIds || [];
      if (t.checked) { if (e.archiveIds.indexOf(id) === -1) e.archiveIds.push(id); } else e.archiveIds = e.archiveIds.filter(function (x) { return x !== id; });
      sauver('« ' + e.title + ' » ' + (t.checked ? 'lié à' : 'délié de') + ' l’archive « ' + archive(id).title + ' ».'); apercuEntree(e); return;
    }
    if (t.hasAttribute('data-fichier-archive') && t.files[0]) {
      var a = archive(f.getAttribute('data-archive'));
      A.coffre.reduire(t.files[0]).then(function (d) { return A.coffre.ecrire(a.id, d); }).then(function () { sauver('Image déposée pour « ' + a.title + ' » (sur cet appareil).'); rendre(); })
        .catch(function () { etatEl.textContent = 'Cette image n’a pas pu être lue.'; });
    }
  });
  vue.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    var d = D(), e = entree(S.choix);
    if (b.hasAttribute('data-choisir')) { S.choix = b.getAttribute('data-choisir'); sauver(); rendre(); }
    else if (b.hasAttribute('data-monter') || b.hasAttribute('data-descendre')) {
      var i = +(b.getAttribute('data-monter') || b.getAttribute('data-descendre')), j = b.hasAttribute('data-monter') ? i - 1 : i + 1, x = d.entrees[i];
      d.entrees[i] = d.entrees[j]; d.entrees[j] = x; sauver('« ' + x.title + ' » déplacé.'); rendre();
    }
    else if (b.hasAttribute('data-ajouter-entree')) {
      var n = { id: nouvelId('e'), title: 'Nouvel événement', dateStart: '', dateEnd: '', datePrecision: 'inconnue', educationPeriod: '', narrative: '', people: [], mediaIds: [], archiveIds: [], relatedProjectIds: [], relatedEntryIds: [], lifebookRef: '', evidenceStatus: 'a-verifier', visibility: 'public', publicationStatus: 'brouillon', layoutVariant: 'papier', bandeau: '', video: '', createdAt: jour(), updatedAt: jour() };
      d.entrees.push(n); S.choix = n.id; sauver('Événement créé, en brouillon.'); rendre();
      var t = vue.querySelector('[data-c="title"]'); if (t) { t.focus(); t.select(); }
    }
    else if (b.hasAttribute('data-supprimer-entree') && e && confirm('Supprimer « ' + e.title + ' » ? Les versions publiées le gardent.')) {
      d.entrees = d.entrees.filter(function (x) { return x !== e; }); d.relations = d.relations.filter(function (r) { return r.de !== e.id && r.vers !== e.id; }); S.choix = d.entrees[0] && d.entrees[0].id; sauver('« ' + e.title + ' » supprimé.'); rendre();
    }
    else if (b.hasAttribute('data-ajouter-personne') && e) { e.people = e.people || []; e.people.push({ nom: '', role: '', note: '', sources: [] }); sauver(); rendre(); }
    else if (b.hasAttribute('data-retirer-personne') && e) { e.people.splice(+b.getAttribute('data-retirer-personne'), 1); sauver('Une personne retirée de « ' + e.title + ' ».'); rendre(); }
    else if (b.hasAttribute('data-apercu-ici')) apercu(e && e.id);
    else if (b.hasAttribute('data-choisir-archive')) { archiveChoisie = b.getAttribute('data-choisir-archive'); rendre(); }
    else if (b.hasAttribute('data-ajouter-archive')) {
      var a = { id: nouvelId('a'), mediaType: 'photo', title: 'Nouvelle archive', originalDate: '', author: '', source: '', usageRights: '', privacy: 'prive', storageRef: '', thumbnailRef: '', relatedEntryIds: [] };
      d.archives.push(a); archiveChoisie = a.id; sauver('Archive créée, privée.'); rendre();
    }
    else if (b.hasAttribute('data-supprimer-archive')) {
      var ar = archive(archiveChoisie); if (!ar || !confirm('Supprimer l’archive « ' + ar.title + ' » ?')) return;
      d.archives = d.archives.filter(function (x) { return x !== ar; }); d.entrees.forEach(function (x) { x.archiveIds = (x.archiveIds || []).filter(function (id) { return id !== ar.id; }); });
      A.coffre.effacer(ar.id); archiveChoisie = null; sauver('Archive « ' + ar.title + ' » supprimée.'); rendre();
    }
    else if (b.hasAttribute('data-ajouter-relation')) {
      var f = document.getElementById('nouvelle-relation'), r = { de: f.de.value, vers: f.vers.value, nature: f.nature.value, justification: f.justification.value.trim(), auteur: f.auteur.value };
      if (!r.justification) { f.justification.focus(); etatEl.textContent = 'Une relation sans justification n’est pas enregistrée.'; return; }
      if (r.de === r.vers) { etatEl.textContent = 'Un événement ne se relie pas à lui-même.'; return; }
      d.relations.push(r); var src = entree(r.de); if (src && r.vers.indexOf(':') === -1 && (src.relatedEntryIds || []).indexOf(r.vers) === -1) (src.relatedEntryIds = src.relatedEntryIds || []).push(r.vers);
      sauver('Relation ajoutée.'); rendre();
    }
    else if (b.hasAttribute('data-retirer-relation')) { d.relations.splice(+b.getAttribute('data-retirer-relation'), 1); sauver('Relation retirée.'); rendre(); }
    else if (b.hasAttribute('data-restaurer')) {
      var v = S.versions.filter(function (x) { return x.n === +b.getAttribute('data-restaurer'); })[0];
      if (v && confirm('Revenir à la version ' + v.n + ' ? Le travail en cours est remplacé ; il reste dans le journal, pas son contenu.')) {
        var garde = d.archives.filter(function (a) { return a.privacy !== 'publie'; });
        S.donnees = copie(v.donnees); garde.forEach(function (a) { if (!archive(a.id)) S.donnees.archives.push(a); });
        sauver('Retour à la version ' + v.n + '.'); onglet = 'entrees'; rendre();
      }
    }
    else if (b.hasAttribute('data-exporter-version')) { var w = S.versions.filter(function (x) { return x.n === +b.getAttribute('data-exporter-version'); })[0]; if (w) telecharger('chronologie.js', fichierPublic(publique(w.donnees)), 'text/javascript'); }
    else if (b.hasAttribute('data-exporter-lifebook')) { telecharger('corpus.json', JSON.stringify(corpusLifebook(), null, 2), 'application/json'); noter('Corpus LIFEBOOK exporté (privé).'); sauver(); }
  });

  function apercu(id) { sauver(); window.open('index.html?apercu=1' + (id ? '#' + id : '#avant'), '_blank', 'noopener'); }
  document.getElementById('apercu').addEventListener('click', function () { apercu(S.choix); });
  document.getElementById('publier').addEventListener('click', function () {
    var p = publique(D()), n = S.versions.length + 1, note = prompt('Publier : une note pour cette version (facultatif)', '') ;
    if (note === null) return;
    S.versions.push({ n: n, quand: maintenant(), note: note || 'Publication', donnees: copie(D()) });
    sauver('Version ' + n + ' publiée dans l’éditeur : ' + p.entrees.length + ' événements publics, ' + p.archives.length + ' archives publiques.');
    p.version = n; telecharger('chronologie.js', fichierPublic(p), 'text/javascript');
    etatEl.textContent = 'Version ' + n + ' enregistrée. Le fichier chronologie.js est téléchargé : déposez-le dans data/ du dépôt pour le rendre public.';
    if (onglet === 'versions') rendre();
  });

  sauver(); rendre();
  A.admin = { publique: publique, corpusLifebook: corpusLifebook, etat: function () { return S; } };   /* pour les tests */
})();
