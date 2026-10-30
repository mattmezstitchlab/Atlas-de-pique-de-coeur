/* L’achèvement : ce qui peut être construit, en briques, à partir de ce qui a été refait le plus souvent.
   Une brique par famille (data/applications.js). « tentatives » = nombre d’applications Base44 de la famille ;
   « exemples » = les noms les plus souvent recommencés, avec leur nombre de versions.
   La composition (x, y, w, h sur une grille de 12 colonnes) est une proposition : elle se déplace dans la Métamorphose. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.achevement = {
  principe: 'Ce qui a été recommencé le plus souvent n’est pas un échec : c’est ce qui cherche sa forme. Chaque famille devient une brique, et les briques posées ensemble font un seul lieu.',
  briques: [
    { id: 'aime', famille: 'aime', titre: 'Le Point', role: 'Une seule entrée : un compte, une orbe, Mon confort. Tout part d’ici.',
      tentatives: 55, exemples: [['AIME', 26], ['LE MONDE AIME', 7], ['AIME®', 7]], style: 'nacre', x: 0, y: 0, w: 12, h: 2 },
    { id: 'mariage', famille: 'mariage', titre: 'Le Jour J', role: 'Le cockpit de l’union : rôles, moments, invités, plans B.',
      tentatives: 78, exemples: [['AIME® Wedding — le cockpit', 9], ['Mariage Vibratoire', 3], ['Cérémonial', 3]], style: 'photo', x: 0, y: 2, w: 6, h: 3 },
    { id: 'temps', famille: 'temps', titre: 'Le Temps', role: 'Une seule timeline par couches : la journée, l’année, une vie.',
      tentatives: 31, exemples: [['Timeheart', 3], ['AIME Timeline', 3], ['Time Circle Line', 2]], style: 'carte', x: 6, y: 2, w: 3, h: 3 },
    { id: 'preuve', famille: 'preuve', titre: 'La Preuve', role: 'Le passeport et le cachet : qui était là, qui a dit oui, qui a le droit.',
      tentatives: 28, exemples: [['AIME Stamp', 7], ['AIME Cachet', 4], ['Signature Vibratoire', 3]], style: 'carte', x: 9, y: 2, w: 3, h: 3 },
    { id: 'musique', famille: 'musique', titre: 'La Musique', role: 'Réserver, jouer, se souvenir : la bande originale de chaque moment.',
      tentatives: 58, exemples: [['SaxEvent Booking', 4], ['ARTIST CONNECT', 3], ['SAXXX', 2]], style: 'sombre', x: 0, y: 5, w: 4, h: 3 },
    { id: 'broderie', famille: 'broderie', titre: 'La Grille', role: 'Point Zéro : de l’image au patron, du patron au fil.',
      tentatives: 52, exemples: [['PATY Point de Croix', 2], ['Coloria', 2], ['BIRD', 2]], style: 'grille', x: 4, y: 5, w: 4, h: 3 },
    { id: 'memoire', famille: 'memoire', titre: 'La Mémoire', role: 'Ce qui reste : la voix, les récits, le journal, la transmission.',
      tentatives: 22, exemples: [['CIRCLE OF LIFE', 3], ['SLÂME', 2], ['Le Petit Guide', 2]], style: 'carte', x: 8, y: 5, w: 4, h: 3 },
    { id: 'lieux', famille: 'lieux', titre: 'Les Lieux', role: 'Sortir, se retrouver, s’entraider près de chez soi.',
      tentatives: 62, exemples: [['ONE', 6], ['VYBZ', 3], ['Place Publique', 3]], style: 'carte', x: 0, y: 8, w: 6, h: 2 },
    { id: 'soin', famille: 'soin', titre: 'La Présence', role: 'Prendre soin : le calme, le confort, l’accompagnement.',
      tentatives: 45, exemples: [['BLOOM', 5], ['SOLUX', 2], ['Aura', 2]], style: 'carte', x: 6, y: 8, w: 3, h: 2 },
    { id: 'demarches', famille: 'demarches', titre: 'Les Démarches', role: 'Le cerveau administratif : dossiers, contrats, métiers.',
      tentatives: 45, exemples: [['LIBERTYX', 2], ['Nomad No Cry', 2], ['RUCHE', 2]], style: 'carte', x: 9, y: 8, w: 3, h: 2 },
    { id: 'edition', famille: 'edition', titre: 'La Vitrine', role: 'Montrer : le magazine, le portfolio, la page de chaque personne.',
      tentatives: 33, exemples: [['AIME Magazine', 7], ['Artistry', 3], ['AIME Living Editorial', 2]], style: 'carte', x: 0, y: 10, w: 6, h: 2 },
    { id: 'systemes', famille: 'systemes', titre: 'L’Atlas', role: 'La carte de tout ce qui existe, pour composer le reste.',
      tentatives: 32, exemples: [['GAÏA', 4], ['Nexus', 2], ['LUMINA', 2]], style: 'sombre', x: 6, y: 10, w: 6, h: 2 }
  ]
};
