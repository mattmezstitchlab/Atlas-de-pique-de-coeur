/* La publication volontaire d’une composition : la plus petite fonction qui donne une adresse publique à une création.
   Fonctions pures, partagées par la Composition (préparer le fichier) et la page de lecture (/composition/<id>) :
   - publier(etat, choix) : ne garde que les champs autorisés (forme de la grille, rien de ce qui a été saisi) ;
   - identifiant(titre, contenu) : le même contenu sous le même titre donne toujours le même identifiant ;
   - valider(pub, idAttendu) : refuse proprement une création invalide, privée, non publiée ou qui ne correspond pas à son adresse.
   Rien n’est envoyé : le fichier est téléchargé, puis ajouté au dépôt dans creations/ par une personne (docs/PUBLICATION.md). */
(function () {
  var A = window.ATLAS = window.ATLAS || {};
  var FORMAT = 'atlas-creation', VERSION = 1;
  var CHAMPS = ['format', 'version', 'id', 'titre', 'description', 'publieLe', 'visibility', 'publicationStatus', 'blocs', 'liens', 'mise'];
  var CHAMPS_BLOC = ['uid', 'type', 'ref', 'x', 'y', 'w', 'h', 'style', 'visuel', 'intentions', 'parts'];
  var TYPES = ['brique', 'groupe', 'module', 'visuel', 'fusion'];
  var STYLES = ['carte', 'sombre', 'nacre', 'grille', 'photo', 'une', 'section'];
  var MISES = ['achevement', 'une', 'magazine', 'bento', 'mosaique', 'grille'];
  var ID = /^[a-z0-9-]{1,80}$/;

  /* les références publiques connues : celles des fichiers de données de l’atlas (le même calcul des projets que js/metamorphose.js) */
  var base = function (n) { return n.replace(/\s*\(copy\)/gi, '').replace(/\s+copy$/i, '').trim(); };
  var connus = null;
  function references() {
    if (connus) return connus;
    var c = { brique: {}, module: {}, visuel: {}, groupe: {}, intention: {} };
    ((A.achevement || {}).briques || []).forEach(function (b) { c.brique[b.id] = 1; });
    (A.modules || []).forEach(function (m) { c.module[m.id] = 1; });
    (A.visuels || []).forEach(function (v) { c.visuel[v.id] = 1; });
    (A.applications || []).forEach(function (a) { c.groupe[a[2] + '|' + base(a[1])] = 1; });
    var lx = A.lexique || {}; Object.keys(lx.intentions || {}).forEach(function (k) { c.intention[k] = 1; });
    return (connus = c);
  }

  var sansAccents = function (s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  var slug = function (s) { return sansAccents(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64).replace(/-+$/, ''); };
  /* FNV-1a 32 bits : une empreinte courte et déterministe, pas une sécurité */
  function empreinte(s) { var h = 0x811c9dc5; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8).slice(0, 6); }
  function identifiant(titre, contenu) { return (slug(titre) || 'creation') + '-' + empreinte(JSON.stringify(contenu)); }

  var entier = function (n, min, max) { return typeof n === 'number' && n === Math.floor(n) && n >= min && n <= max; };

  /* un bloc public : sa forme et sa référence, les intentions (des mots du lexique) ; jamais les phrases, ce qui a été reconnu, les réglages d’image ni les données des modules */
  function blocPublic(b, renum) {
    var p = { uid: renum(b.uid), type: b.type, ref: b.ref, x: b.x, y: b.y, w: b.w, h: b.h };
    if (b.type === 'fusion') { delete p.ref; p.parts = (b.parts || []).map(function (x) { return blocPublic(x, renum); }); }
    if (b.style && STYLES.indexOf(b.style) !== -1) p.style = b.style;
    if (b.visuel && references().visuel[b.visuel]) p.visuel = b.visuel;
    var ints = (b.demandes || []).map(function (d) { return d.intention; }).filter(function (i, k, l) { return i && references().intention[i] && l.indexOf(i) === k; });
    if (ints.length) p.intentions = ints;
    return p;
  }

  function publier(etat, choix) {
    var titre = String(choix.titre || '').trim().replace(/\s+/g, ' ').slice(0, 80);
    if (!titre) throw new Error('Un titre est nécessaire pour publier.');
    var n = 0, table = {}, renum = function (u) { if (!table[u]) table[u] = 'p' + (++n); return table[u]; };
    var blocs = (etat.blocs || []).filter(function (b) { return TYPES.indexOf(b.type) !== -1; }).map(function (b) { return blocPublic(b, renum); });
    var liens = (etat.liens || []).filter(function (l) { return table[l[0]] && table[l[1]]; }).map(function (l) { return [table[l[0]], table[l[1]]]; });
    var mise = MISES.indexOf(etat.mise) !== -1 ? etat.mise : null;
    var pub = {
      format: FORMAT, version: VERSION, id: identifiant(titre, { blocs: blocs, liens: liens, mise: mise }), titre: titre,
      description: String(choix.description || '').trim().replace(/\s+/g, ' ').slice(0, 280),
      publieLe: choix.date || new Date().toISOString().slice(0, 10),
      visibility: 'public', publicationStatus: 'publie',
      blocs: blocs, liens: liens, mise: mise
    };
    var v = valider(pub); if (!v.ok) throw new Error(v.raison);
    return pub;
  }

  /* la lecture : chaque refus dit pourquoi, et rien n’est affiché d’une création refusée */
  function validerBloc(b, uids, profondeur) {
    if (!b || typeof b !== 'object') return 'un bloc est illisible';
    var cles = Object.keys(b).filter(function (k) { return CHAMPS_BLOC.indexOf(k) === -1; }); if (cles.length) return 'un bloc porte des champs non autorisés (' + cles.join(', ') + ')';
    if (TYPES.indexOf(b.type) === -1) return 'un bloc est d’un type inconnu';
    if (typeof b.uid !== 'string' || !/^p\d{1,4}$/.test(b.uid) || uids[b.uid]) return 'un bloc a un repère invalide'; uids[b.uid] = 1;
    if (!entier(b.x, 0, 11) || !entier(b.w, 1, 12) || b.x + b.w > 12 || !entier(b.y, 0, 400) || !entier(b.h, 1, 40)) return 'un bloc sort de la grille';
    if (b.style !== undefined && STYLES.indexOf(b.style) === -1) return 'un bloc a un style inconnu';
    if (b.visuel !== undefined && !references().visuel[b.visuel]) return 'un bloc renvoie à un visuel inconnu';
    if (b.intentions !== undefined && !(Array.isArray(b.intentions) && b.intentions.every(function (i) { return references().intention[i]; }))) return 'un bloc porte une intention inconnue';
    if (b.type === 'fusion') {
      if (profondeur || !Array.isArray(b.parts) || b.parts.length < 2) return 'une fusion est mal formée';
      for (var i = 0; i < b.parts.length; i++) { var e = validerBloc(b.parts[i], uids, 1); if (e) return e; }
      return '';
    }
    if (b.parts !== undefined) return 'un bloc simple ne peut pas contenir de parties';
    if (!references()[b.type][b.ref]) return 'un bloc renvoie à « ' + b.type + ' » inconnu de l’atlas';
    return '';
  }
  function valider(pub, idAttendu) {
    var non = function (code, raison) { return { ok: false, code: code, raison: raison }; };
    if (!pub || typeof pub !== 'object' || Array.isArray(pub)) return non('invalide', 'Ce fichier n’est pas une création ATLAS.');
    if (pub.format !== FORMAT || pub.version !== VERSION) return non('invalide', 'Ce fichier n’est pas une création ATLAS (format ' + pub.format + ', version ' + pub.version + ').');
    if (pub.visibility !== 'public') return non('privee', 'Cette création est privée : elle ne peut pas être ouverte ici.');
    if (pub.publicationStatus !== 'publie') return non('non-publiee', 'Cette création n’est pas publiée.');
    var cles = Object.keys(pub).filter(function (k) { return CHAMPS.indexOf(k) === -1; });
    if (cles.length) return non('invalide', 'La création porte des champs non autorisés : ' + cles.join(', ') + '.');
    if (typeof pub.id !== 'string' || !ID.test(pub.id)) return non('invalide', 'L’identifiant de la création est invalide.');
    if (idAttendu !== undefined && pub.id !== idAttendu) return non('invalide', 'Le fichier ne correspond pas à cette adresse.');
    if (typeof pub.titre !== 'string' || !pub.titre.trim() || pub.titre.length > 80) return non('invalide', 'Le titre est absent ou trop long.');
    if (typeof pub.description !== 'string' || pub.description.length > 280) return non('invalide', 'La description est invalide.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pub.publieLe)) return non('invalide', 'La date de publication est invalide.');
    if (pub.mise !== null && MISES.indexOf(pub.mise) === -1) return non('invalide', 'La mise en page est inconnue.');
    if (!Array.isArray(pub.blocs) || !pub.blocs.length || pub.blocs.length > 200) return non('invalide', 'La création ne contient aucun bloc lisible.');
    var uids = {};
    for (var i = 0; i < pub.blocs.length; i++) { var e = validerBloc(pub.blocs[i], uids, 0); if (e) return non('invalide', 'La création est refusée : ' + e + '.'); }
    if (!Array.isArray(pub.liens) || !pub.liens.every(function (l) { return Array.isArray(l) && l.length === 2 && uids[l[0]] && uids[l[1]] && l[0] !== l[1]; })) return non('invalide', 'Un lien relie des blocs absents.');
    if (identifiant(pub.titre, { blocs: pub.blocs, liens: pub.liens, mise: pub.mise }) !== pub.id) return non('invalide', 'L’identifiant ne correspond pas au contenu : le fichier a été modifié après sa préparation.');
    return { ok: true };
  }

  A.publication = { FORMAT: FORMAT, VERSION: VERSION, CHAMPS: CHAMPS, ID: ID, publier: publier, valider: valider, identifiant: identifiant, slug: slug };
})();
