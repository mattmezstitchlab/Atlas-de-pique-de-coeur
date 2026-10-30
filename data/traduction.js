/* La table du traducteur : ce qui relie une demande lue par le moteur (js/moteur.js) aux fragments de la Composition.
   Ce n’est pas un nouveau moteur : une simple correspondance, lue dans l’ordre.
   - « modules » : des mots (sans accents, début de mot) qui appellent un module de data/modules.js.
   - « briques » : des mots qui appellent une brique de data/achevement.js.
   - « parIntention » : quand aucun mot ne parle, la brique que l’intention du moteur appelle (data/lexique.js).
   Les mots sont une première liste, à compléter comme data/lexique.js : un mot non reconnu ne propose rien. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.traduction = {
  modules: {
    agenda: ['agenda', 'rendez-vous', 'rdv', 'reserv', 'calendrier', 'disponib', 'creneau'],
    timeline: ['deroule', 'programme', 'planning', 'timeline', 'etape', 'retroplanning', 'heure par heure', 'chronolog'],
    facture: ['factur', 'devis', 'payer', 'paiement', 'tarif', 'budget', 'acompte'],
    documents: ['document', 'contrat', 'dossier', 'papiers', 'attestation', 'formulaire'],
    invites: ['invite', 'invitation', 'convive', 'rsvp', 'faire-part', 'temoin'],
    musique: ['musique', 'playlist', 'chanson', 'morceau', 'dj', 'saxo', 'concert', 'groupe de musique'],
    galerie: ['photo', 'galerie', 'album', 'souvenirs en image'],
    missions: ['mission', 'tache', 'qui fait quoi', 'benevole', 'coup de main', 'repartir'],
    intermittent: ['intermittent', 'cachet', 'guso', 'heures declarees']
  },
  briques: {
    mariage: ['mariage', 'marier', 'noces', 'union', 'jour j'],
    broderie: ['brod', 'broderie', 'patron', 'point de croix'],
    memoire: ['souvenir', 'memoire', 'recit', 'raconter', 'transmettre'],
    lieux: ['salle', 'lieu', 'traiteur', 'restaurant', 'sortie'],
    soin: ['stress', 'dormir', 'angoiss', 'fatigue', 'calme'],
    edition: ['affiche', 'magazine', 'portfolio', 'page', 'discours', 'texte']
  },
  parIntention: {
    conseil: 'soin', ecriture: 'edition', information: 'systemes', technique: 'systemes',
    image: 'edition', expression: 'memoire', soutien: 'soin'
  }
};
