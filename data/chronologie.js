/* La chronologie publiée (1999 – 2025) : ce qui précède l’inventaire Base44 de novembre 2025.
   Ce fichier est PUBLIC : il ne contient que les entrées publiées et les archives publiées.
   Il est produit par l’éditeur (admin.html → « Exporter la version publiée »). Les brouillons, les archives privées
   et les références LIFEBOOK restent dans l’éditeur, jamais ici.

   TimelineEntry : { id, title, dateStart, dateEnd, datePrecision, educationPeriod, narrative, people, mediaIds, archiveIds,
                     relatedProjectIds, relatedEntryIds, evidenceStatus, visibility, publicationStatus, layoutVariant, bandeau,
                     video, createdAt, updatedAt }
     datePrecision : exacte | mois | annee | periode | approx | inconnue   (approx = années déduites d’une durée)
     evidenceStatus : document | declare | a-verifier                       (document = établi par une pièce)
     layoutVariant : papier | magazine | televiseur | archive | duo | lacune | bandeau
   Archive : { id, mediaType, title, originalDate, author, source, usageRights, privacy, storageRef, thumbnailRef, relatedEntryIds }
     privacy : prive | publiable | publie   (seules les archives « publie » figurent dans ce fichier)
   Relation : { de, vers, nature, justification, auteur } — une relation est toujours décrite et justifiée, jamais déduite. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.chronologie = {
  format: 'atlas-chronologie', schemaVersion: 1, publieLe: '2026-10-30', version: 1,
  titre: 'Avant l’inventaire',
  chapeau: 'Six années de formation à Saint-Luc, une première exposition, vingt ans de pratique à documenter. Ce qui précède les 643 applications, et qui aide à les lire.',
  entrees: [
    { id: 'e-1999-comines', title: 'Première exposition, à Comines', dateStart: '1999', dateEnd: '', datePrecision: 'annee', educationPeriod: '',
      narrative: 'La première exposition. Elle a lieu au début des études secondaires à Saint-Luc. Les œuvres, les photographies, l’affiche et les documents de l’époque sont à déposer dans les archives.',
      people: [], mediaIds: [], archiveIds: ['a-comines-oeuvres', 'a-comines-affiche'], relatedProjectIds: [], relatedEntryIds: ['e-saint-luc-secondaire'],
      evidenceStatus: 'declare', visibility: 'public', publicationStatus: 'publie', layoutVariant: 'archive', bandeau: '', video: '',
      createdAt: '2026-10-30', updatedAt: '2026-10-30' },
    { id: 'e-saint-luc-secondaire', title: 'Saint-Luc, l’enseignement secondaire artistique', dateStart: '1999', dateEnd: '2002', datePrecision: 'approx', educationPeriod: 'secondaire',
      narrative: 'Trois années d’études secondaires, que l’auteur nomme « Arts décoratifs conceptuels » ; l’intitulé officiel est à vérifier sur les documents scolaires. Les années sont déduites de la durée.',
      people: [{ nom: 'Aldo Guillaume Turin', role: 'Enseignant', note: 'A travaillé dans l’enseignement, la sémiologie, le cinéma, l’écriture et la critique artistique.',
        sources: ['https://editeurssinguliers.be/fiche-auteur/aldo-guillaume-turin/', 'https://www.thanksgalerie.be/expo-petitsformats2425'] }],
      contexte: 'Un contexte : des enseignants qui lisaient l’image, l’écrivaient et la critiquaient.',
      mediaIds: [], archiveIds: [], relatedProjectIds: [], relatedEntryIds: ['e-saint-luc-superieur'],
      evidenceStatus: 'declare', visibility: 'public', publicationStatus: 'publie', layoutVariant: 'papier', bandeau: '', video: '',
      createdAt: '2026-10-30', updatedAt: '2026-10-30' },
    { id: 'e-saint-luc-superieur', title: 'École supérieure des arts Saint-Luc, Tournai', dateStart: '2002', dateEnd: '2005', datePrecision: 'approx', educationPeriod: 'superieur',
      narrative: 'Trois années d’enseignement artistique supérieur. L’intitulé du diplôme, la spécialité et l’intitulé de la mention seront complétés depuis les archives ; les années de début sont déduites de la durée.',
      people: [{ nom: 'Yannick Carlier', role: 'Professeur d’atelier, plasticien', note: 'Une pédagogie qui mêle laboratoire créatif, langage graphique, expression personnelle, expérimentation et pratiques contemporaines.',
        sources: ['https://stluc-sup-tournai.be/portrait/yannick-carlier/', 'https://stluc-sup-tournai.be/lecole/la-formation/', 'https://stluc-sup-tournai.be/lecole/historique/'] }],
      mediaIds: [], archiveIds: ['a-travaux-atelier'], relatedProjectIds: [], relatedEntryIds: ['e-clip-saint-luc', 'e-cube-grille', 'e-2005-sortie'],
      evidenceStatus: 'declare', visibility: 'public', publicationStatus: 'publie', layoutVariant: 'magazine', bandeau: '', video: '',
      createdAt: '2026-10-30', updatedAt: '2026-10-30' },
    { id: 'e-clip-saint-luc', title: 'UPTOWN', dateStart: '2002', dateEnd: '2005', datePrecision: 'periode', educationPeriod: 'superieur',
      narrative: 'Un clip de Matt Mez, « un rêve sous la musique accélérée ». L’image y est déjà une mosaïque : une même figure répétée case par case, sur une vue aérienne de ville, traversée par la silhouette d’un casque.',
      auteurVideo: 'Matt Mez (chaîne YouTube Matt Mez Sax)',
      miseEnLigne: 'Mise en ligne sur YouTube il y a 19 ans d’après la page de la vidéo (vers 2007) ; réalisée pendant les années de Saint-Luc, selon l’auteur.',
      mediaIds: [], archiveIds: [], relatedProjectIds: [], relatedEntryIds: ['e-cube-grille'],
      evidenceStatus: 'declare', visibility: 'public', publicationStatus: 'publie', layoutVariant: 'televiseur', bandeau: '',
      video: 'https://www.youtube.com/watch?v=XgKcenvjMdI',
      createdAt: '2026-10-30', updatedAt: '2026-10-30' },
    { id: 'e-cube-grille', title: 'Du cube à la grille', dateStart: '2002', dateEnd: '2026', datePrecision: 'periode', educationPeriod: '',
      narrative: 'Pendant les études : le carré, le cube, la mosaïque, l’image en mouvement, la matière, le rapport entre les éléments, la transformation visuelle. Aujourd’hui, l’atlas retrouve la grille et .0NE développe le cercle et le Point.',
      lecture: 'Une lecture d’aujourd’hui, proposée par l’auteur : pas une filiation technique. Aucun des logiciels actuels n’existait en 2005.',
      mediaIds: [], archiveIds: ['a-travaux-atelier'], relatedProjectIds: ['metamorphose', 'atlas'], relatedEntryIds: [],
      evidenceStatus: 'declare', visibility: 'public', publicationStatus: 'publie', layoutVariant: 'duo', bandeau: '', video: '',
      createdAt: '2026-10-30', updatedAt: '2026-10-30' },
    { id: 'e-2005-sortie', title: 'Sortie de Saint-Luc, avec mention', dateStart: '2005', dateEnd: '', datePrecision: 'annee', educationPeriod: 'superieur',
      narrative: 'Fin des études supérieures, avec mention. Le diplôme sert à vérifier la date ; ses informations personnelles restent privées.',
      mediaIds: [], archiveIds: [], relatedProjectIds: [], relatedEntryIds: ['e-2005-2024'],
      evidenceStatus: 'declare', visibility: 'public', publicationStatus: 'publie', layoutVariant: 'papier', bandeau: '', video: '',
      createdAt: '2026-10-30', updatedAt: '2026-10-30' },
    { id: 'e-2005-2024', title: 'Vingt ans de pratique', dateStart: '2005', dateEnd: '2024', datePrecision: 'periode', educationPeriod: '',
      narrative: 'Musique et saxophone, graphisme, photographie, vidéo, direction artistique, événements, recherches, expériences humaines. Aucune date n’est encore documentée pour cette période : elle se remplira archive par archive.',
      themes: ['Musique', 'Saxophone', 'Graphisme', 'Photographie', 'Vidéo', 'Direction artistique', 'Événements', 'Recherches', 'Expériences humaines'],
      mediaIds: [], archiveIds: [], relatedProjectIds: [], relatedEntryIds: ['e-2025-monde-aime'],
      evidenceStatus: 'a-verifier', visibility: 'public', publicationStatus: 'publie', layoutVariant: 'lacune', bandeau: 'scene', video: '',
      createdAt: '2026-10-30', updatedAt: '2026-10-30' },
    { id: 'e-2025-monde-aime', title: 'Le Monde AIME, l’association', dateStart: '2025', dateEnd: '', datePrecision: 'annee', educationPeriod: '',
      narrative: 'La création associative, les projets musicaux et les premiers ensembles numériques, à documenter. Le premier ensemble daté commence le 10 novembre 2025 : la première application Base44.',
      mediaIds: [], archiveIds: [], relatedProjectIds: [], relatedEntryIds: [],
      evidenceStatus: 'declare', visibility: 'public', publicationStatus: 'publie', layoutVariant: 'bandeau', bandeau: 'phare', video: '',
      versChapitre: 'novembre',
      createdAt: '2026-10-30', updatedAt: '2026-10-30' }
  ],
  /* Seules les archives publiées figurent ici. Celles qui attendent leur pièce s’affichent comme une place réservée. */
  archives: [
    { id: 'a-comines-oeuvres', mediaType: 'oeuvre', title: 'Œuvres exposées à Comines', originalDate: '1999', author: 'Matthieu Lecointre', source: 'Archives de l’auteur', usageRights: 'à préciser', privacy: 'publie', storageRef: '', thumbnailRef: '', relatedEntryIds: ['e-1999-comines'], attente: true },
    { id: 'a-comines-affiche', mediaType: 'affiche', title: 'Affiche de l’exposition', originalDate: '1999', author: '', source: 'Archives de l’auteur', usageRights: 'à préciser', privacy: 'publie', storageRef: '', thumbnailRef: '', relatedEntryIds: ['e-1999-comines'], attente: true },
    { id: 'a-travaux-atelier', mediaType: 'oeuvre', title: 'Travaux d’atelier : carré, cube, mosaïque', originalDate: '2002–2005', author: 'Matthieu Lecointre', source: 'Archives de l’auteur', usageRights: 'à préciser', privacy: 'publie', storageRef: '', thumbnailRef: '', relatedEntryIds: ['e-saint-luc-superieur', 'e-cube-grille'], attente: true }
  ],
  /* Les relations, décrites et justifiées (l’axe des relations) */
  relations: [
    { de: 'e-cube-grille', vers: 'chapitre:mai', nature: 'devenu', justification: 'Le Point (mai 2026) : un centre, un cercle, puis tout le reste. La lecture du cercle par l’auteur.', auteur: 'declare' },
    { de: 'e-cube-grille', vers: 'chapitre:juin', nature: 'devenu', justification: 'L’atlas (juin 2026) : la carte de tout ce qui existe, rangée en grille.', auteur: 'declare' },
    { de: 'e-cube-grille', vers: 'page:metamorphose', nature: 'devenu', justification: 'La Métamorphose (octobre 2026) : des fragments carrés sur une grille de 12 colonnes, qui se relient.', auteur: 'declare' },
    { de: 'e-clip-saint-luc', vers: 'e-cube-grille', nature: 'eclaire', justification: 'Dans UPTOWN, l’image est déjà une grille : une même figure répétée case par case. Observé sur une image extraite de la vidéo.', auteur: 'document' },
    { de: 'e-2025-monde-aime', vers: 'chapitre:novembre', nature: 'suite', justification: 'Le premier ensemble daté : 99 applications créées entre le 10 et le 30 novembre 2025 (API Base44).', auteur: 'document' }
  ]
};
