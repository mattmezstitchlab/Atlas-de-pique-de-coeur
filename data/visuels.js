/* La bibliothèque des visuels : la photographie de la marque, rangée dans media/.
   Les images viennent de LEMONDEAIME (public/media) ; les textes « alt » reprennent ceux de src/lib/medias.ts quand ils existent.
   « famille » relie le visuel à une famille de data/applications.js : c’est lui qui habille la brique ou le fragment de cette famille.
   Un visuel : { id, src, alt, accroche, legende, famille, pos? } (pos = cadrage CSS object-position). */
window.ATLAS = window.ATLAS || {};
window.ATLAS.visuels = [
  { id: 'phare', src: 'media/phare.jpg', alt: 'Un couple au pied d’un phare face à la mer agitée au coucher du soleil', accroche: 'Point Zéro', legende: 'Tout commence quelque part', famille: 'aime', pos: 'center 55%' },
  { id: 'sculpture', src: 'media/sculpture.jpg', alt: 'Sculpture abstraite en métal, faite de blocs imbriqués, éclairée par un faisceau chaud sur fond sombre', accroche: 'Manifeste', legende: 'Des pièces qui s’emboîtent', famille: 'systemes' },
  { id: 'sous-la-mer', src: 'media/sous-la-mer.jpg', alt: 'Une cérémonie sous un dôme vitré entouré de poissons', accroche: 'Le Monde AIME', legende: 'Chaque studio, un monde', famille: 'explorations', pos: 'center 45%' },
  { id: 'fondateur', src: 'media/fondateur.jpg', alt: 'Matthieu Lecointre à son bureau, devant un écran et des croquis d’interfaces, un saxophone et son chien près de lui', accroche: 'Le fondateur', legende: 'Matthieu Lecointre, à l’atelier', famille: 'demarches', pos: 'center 30%' },
  { id: 'union-camille-gabriel', src: 'media/union-camille-gabriel.jpg', alt: 'Un couple danse sous les étoiles devant un motel du désert', accroche: 'Le mariage', legende: 'Le terrain de démonstration', famille: 'mariage', pos: 'center 40%' },
  { id: 'grille-roses', src: 'media/grille-roses.jpg', alt: 'Un bouquet de roses brodé sur une toile écrue', accroche: 'L’étape 0', legende: 'On part du centre', famille: 'broderie' },
  { id: 'broderie', src: 'media/broderie.jpg', alt: 'Une brodeuse tient une tablette avec une grille et un tambour brodé de roses', accroche: 'Point Zéro', legende: 'Créer le patron et le broder', famille: 'broderie' },
  { id: 'fils', src: 'media/fils.jpg', alt: 'L’atelier Point Zéro : une initiale A brodée de roses, avec la palette des fils DMC dans le dock du bas', accroche: 'Le StudiO', legende: 'L’atelier dans le navigateur', famille: 'edition' },
  { id: 'dessiner', src: 'media/dessiner.jpg', alt: 'L’atelier Point Zéro : une initiale A en point de croix, entourée de tiges fleuries, sur la grille', accroche: 'Dessiner', legende: 'La lettre, case par case', famille: 'edition' },
  { id: 'saxophoniste', src: 'media/saxophoniste.jpg', alt: 'Un saxophoniste en veste grise tient son saxophone ténor, devant un rideau clair', accroche: 'Le réseau', legende: 'Le saxophoniste', famille: 'musique', pos: 'center 30%' },
  { id: 'scene', src: 'media/scene.jpg', alt: 'Les mariés s’embrassent au milieu d’une piste de danse éclairée en rose', accroche: 'La fête', legende: 'Le club, 2 h 17', famille: 'musique' },
  { id: 'facade', src: 'media/facade.jpg', alt: 'Une limousine blanche devant une chapelle de mariage illuminée à Las Vegas', accroche: 'Las Vegas', legende: 'Le chauffeur, 23 h 59', famille: 'lieux' },
  { id: 'laverie', src: 'media/laverie.jpg', alt: 'Des mariés assis sur les machines d’une laverie aux néons pastel, entourés de leurs amis', accroche: 'Partout', legende: 'Une laverie, un samedi', famille: 'lieux' },
  { id: 'collection-mer', src: 'media/collection-mer.jpg', alt: 'Une longue table dressée devant une maison de pierre, sur une falaise au-dessus de la mer', accroche: 'Collection', legende: 'La mer', famille: 'soin' },
  { id: 'collection-forets', src: 'media/collection-forets.jpg', alt: 'Une cérémonie dans la cour d’un château, les invités assis entre deux rangées d’arbres', accroche: 'Collection', legende: 'Les châteaux et les forêts', famille: 'mariage' },
  { id: 'piscine', src: 'media/piscine.jpg', alt: 'Des mariés debout dans la piscine vide d’un motel du désert, sous l’enseigne Desert Lily', accroche: 'Le motel', legende: 'Le désert, l’après-midi', famille: 'temps' },
  { id: 'union', src: 'media/union.jpg', alt: 'Un couple s’embrasse la nuit dans le désert, près d’une voiture ancienne et d’un tourne-disque', accroche: 'L’union', legende: 'Sous les étoiles', famille: 'preuve' },
  { id: 'union-ines-hugo', src: 'media/union-ines-hugo.jpg', alt: 'Un couple sur un balcon des toits de Paris au coucher du soleil, la tour Eiffel au loin', accroche: 'Paris', legende: 'Les toits, le soir', famille: 'memoire' },
  { id: 'wagon', src: 'media/wagon.jpg', alt: 'Des mariés s’embrassent dans un wagon ancien, les montagnes enneigées derrière les fenêtres', accroche: 'Le voyage', legende: 'Demain', famille: 'etudes' }
];
