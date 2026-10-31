/* Le Cube de Saint-Luc : cinq faces en grilles mosaïques, une sixième ouverte sur la chronologie intérieure.
   Les noms, verbes et rôles des faces sont une HYPOTHÈSE de répartition, à étudier : rien n’est figé.
   « lien » : une vraie adresse quand elle existe ; sinon null et la face le dit (« à raccorder »).
   La grille de chaque face fait « cotes » × « cotes » cases. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.cube = {
  cotes: 5,
  hypothese: 'Première hypothèse de répartition, à étudier : les noms et les rôles des faces peuvent changer.',
  faces: [
    { id: 'atlas', nom: 'ATLAS', verbe: 'Rassembler', role: 'Fragments, dossiers, compositions et la Métamorphose.', position: 'droite',
      lien: { titre: 'Ouvrir la Composition', href: 'composition.html' } },
    { id: 'one', nom: '.0NE', verbe: 'Agir', role: 'Les univers du Disque. Le Disque vit dans .0NE ; le Cube n’en embarque pas le moteur.', position: 'haut',
      lien: { titre: 'Ouvrir .0NE', href: 'https://www.lemondeaime.com/studio/one/univers', externe: true } },
    { id: 'liens', nom: 'LIENS', verbe: 'Relier', role: 'Le réseau, les personnes, les collaborations, la Carte universelle AIME.', position: 'gauche',
      lien: null },
    { id: 'memory', nom: 'MEMORY', verbe: 'Transmettre', role: 'Souvenirs, archives, preuves, et LIFEBOOK.', position: 'arriere',
      lien: { titre: 'Les archives et leurs preuves', href: 'chronologie.html#avant' } },
    { id: 'ripple', nom: 'RIPPLE', verbe: 'Comprendre', role: 'Les dépendances, les conséquences, les transformations.', position: 'bas',
      lien: null }
  ],
  ouverture: { id: 'temps', nom: 'TEMPS', verbe: 'Traverser', role: 'La face ouverte : à l’intérieur vit la chronologie.', position: 'avant',
    lien: { titre: 'Ouvrir la chronologie', href: 'chronologie.html' } },
  /* la première disposition proposée : quel type de fragment sur quelle face (une proposition, déplaçable) */
  semis: { atlas: ['brique'], memory: ['moment'], liens: ['module:invites', 'module:missions', 'module:galerie', 'visuel'], one: ['module:agenda', 'module:timeline', 'module:musique'], ripple: ['module:documents', 'module:facture', 'module:intermittent'] }
};
