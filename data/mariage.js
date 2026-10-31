/* Le Cube du Jour J : un mariage D’EXEMPLE (fictif), Camille et Gabriel, le samedi 12 juin 2027, au phare.
   Rien ici ne décrit un vrai mariage : c’est la démonstration du concept, dite comme telle sur la page.
   Quelques manques sont laissés exprès (un contrat non signé, un acompte, un plan B absent, des régimes non renseignés) :
   le Cube doit les trouver tout seul (js/mariage.js), sans qu’on les lui signale.

   personnes : { id, nom, role, etat }        role ∈ maries · temoins · coordination · officiant · traiteur · dj · musicien · photographe · lieu · invites
                                               etat ∈ confirme · relancer
   retroplanning : { id, date, titre, qui, fait, doc? }   (avant le Jour J, vu par les mariés et la coordination)
   jourJ : { id, debut, fin, titre, lieu, exterieur?, qui, pour?, visuel?, planB?, apres?, doc? }
           qui = les personnes qui le font vivre ; pour = les rôles qui le voient en plus (les invités voient le programme public)
           apres = l’identifiant du moment qui doit finir avant (une dépendance) ; planB = { si, alors } ; visuel = un id de data/visuels.js
   documents : { id, nom, type, de, signe?, montant?, acompte?, visible }   acompte = { montant, avant, paye }
   blocs : { id, titre, sous, relie }   les grandes parties du mariage, ce qui les compose
   invites : { nom, table, regime }      regime vide = pas encore renseigné */
window.ATLAS = window.ATLAS || {};
window.ATLAS.mariage = {
  exemple: true,
  couple: 'Camille et Gabriel',
  date: '2027-06-12',
  lieu: 'Le phare',
  personnes: [
    { id: 'camille', nom: 'Camille', role: 'maries', etat: 'confirme' },
    { id: 'gabriel', nom: 'Gabriel', role: 'maries', etat: 'confirme' },
    { id: 'ines', nom: 'Inès, témoin', role: 'temoins', etat: 'confirme' },
    { id: 'hugo', nom: 'Hugo, témoin', role: 'temoins', etat: 'confirme' },
    { id: 'lea', nom: 'Léa, coordinatrice du jour', role: 'coordination', etat: 'confirme' },
    { id: 'aldo', nom: 'Aldo, officiant', role: 'officiant', etat: 'confirme' },
    { id: 'traiteur', nom: 'Le traiteur', role: 'traiteur', etat: 'relancer' },
    { id: 'dj', nom: 'Le DJ', role: 'dj', etat: 'confirme' },
    { id: 'sax', nom: 'Le saxophoniste', role: 'musicien', etat: 'confirme' },
    { id: 'photo', nom: 'La photographe', role: 'photographe', etat: 'confirme' },
    { id: 'phare', nom: 'Le phare, lieu de réception', role: 'lieu', etat: 'confirme' }
  ],
  retroplanning: [
    { id: 'r-lieu', date: '2026-06-20', titre: 'Réserver le lieu', qui: ['camille', 'gabriel', 'phare'], fait: true, doc: 'd-lieu' },
    { id: 'r-photo', date: '2026-09-15', titre: 'Choisir la photographe', qui: ['camille', 'photo'], fait: true, doc: 'd-photo' },
    { id: 'r-traiteur', date: '2026-10-15', titre: 'Signer avec le traiteur', qui: ['gabriel', 'traiteur'], fait: false, doc: 'd-traiteur' },
    { id: 'r-musique', date: '2026-11-30', titre: 'Réserver le DJ et le saxophoniste', qui: ['gabriel', 'dj', 'sax'], fait: true, doc: 'd-dj' },
    { id: 'r-faire-part', date: '2027-02-01', titre: 'Envoyer les faire-part', qui: ['camille', 'gabriel'], fait: false },
    { id: 'r-regimes', date: '2027-04-15', titre: 'Recueillir les régimes des invités', qui: ['ines'], fait: false, doc: 'd-invites' },
    { id: 'r-plan-table', date: '2027-05-20', titre: 'Arrêter le plan de table', qui: ['camille', 'gabriel', 'lea'], fait: false, doc: 'd-invites' },
    { id: 'r-playlist', date: '2027-05-30', titre: 'Envoyer la playlist au DJ', qui: ['camille', 'dj'], fait: false, doc: 'd-playlist' },
    { id: 'r-repetition', date: '2027-06-11', titre: 'Répétition de la cérémonie', qui: ['camille', 'gabriel', 'aldo', 'ines', 'hugo', 'lea'], fait: false }
  ],
  jourJ: [
    { id: 'j-preparatifs', debut: '13:00', fin: '15:00', titre: 'Préparatifs', lieu: 'Les chambres du phare', qui: ['camille', 'gabriel', 'ines', 'hugo', 'photo'], visuel: 'union-ines-hugo' },
    { id: 'j-accueil', debut: '15:30', fin: '16:00', titre: 'Accueil des invités', lieu: 'L’esplanade', exterieur: true, qui: ['lea', 'hugo'], pour: ['invites'], visuel: 'collection-mer' },
    { id: 'j-ceremonie', debut: '16:00', fin: '16:45', titre: 'Cérémonie', lieu: 'Au pied du phare', exterieur: true, qui: ['camille', 'gabriel', 'aldo', 'ines', 'hugo', 'photo', 'sax'], pour: ['invites'], visuel: 'phare', apres: 'j-accueil' },
    { id: 'j-cocktail', debut: '17:00', fin: '19:30', titre: 'Cocktail, au saxophone', lieu: 'Le jardin', exterieur: true, qui: ['traiteur', 'sax', 'photo', 'lea'], pour: ['invites'], visuel: 'saxophoniste', apres: 'j-ceremonie',
      planB: { si: 'pluie', alors: 'Le cocktail passe sous la verrière ; le saxophoniste joue à l’entrée.' } },
    { id: 'j-photos', debut: '18:00', fin: '18:45', titre: 'Photos de groupe', lieu: 'La falaise', exterieur: true, qui: ['camille', 'gabriel', 'photo', 'ines', 'hugo'], visuel: 'union', apres: 'j-ceremonie' },
    { id: 'j-diner', debut: '20:00', fin: '22:30', titre: 'Dîner', lieu: 'La grande salle', qui: ['traiteur', 'lea', 'ines', 'hugo'], pour: ['invites'], visuel: 'collection-forets', apres: 'j-cocktail', doc: 'd-invites' },
    { id: 'j-discours', debut: '22:00', fin: '22:30', titre: 'Discours des témoins', lieu: 'La grande salle', qui: ['ines', 'hugo', 'dj'], pour: ['invites'] },
    { id: 'j-ouverture', debut: '22:30', fin: '22:45', titre: 'Ouverture du bal', lieu: 'La piste', qui: ['camille', 'gabriel', 'dj', 'photo'], pour: ['invites'], visuel: 'union-camille-gabriel', apres: 'j-discours', doc: 'd-playlist' },
    { id: 'j-soiree', debut: '22:45', fin: '02:00', titre: 'Soirée dansante', lieu: 'La piste', qui: ['dj', 'lea'], pour: ['invites'], visuel: 'scene', apres: 'j-ouverture', doc: 'd-dj' },
    { id: 'j-depart', debut: '02:00', fin: '02:30', titre: 'Départ des mariés', lieu: 'L’allée du phare', exterieur: true, qui: ['camille', 'gabriel', 'lea'], pour: ['invites'], visuel: 'facade', apres: 'j-soiree' }
  ],
  documents: [
    { id: 'd-lieu', nom: 'Contrat du phare', type: 'Contrat', de: 'phare', signe: true, montant: 6500, acompte: { montant: 2000, avant: '2026-07-01', paye: true }, visible: ['maries', 'coordination'] },
    { id: 'd-traiteur', nom: 'Devis du traiteur', type: 'Devis', de: 'traiteur', signe: false, montant: 9800, acompte: { montant: 3000, avant: '2026-11-15', paye: false }, visible: ['maries', 'coordination', 'traiteur'] },
    { id: 'd-dj', nom: 'Contrat du DJ', type: 'Contrat', de: 'dj', signe: true, montant: 1200, acompte: { montant: 300, avant: '2027-01-15', paye: false }, visible: ['maries', 'coordination', 'dj'] },
    { id: 'd-photo', nom: 'Contrat de la photographe', type: 'Contrat', de: 'photo', signe: true, montant: 2400, acompte: { montant: 800, avant: '2026-10-01', paye: true }, visible: ['maries', 'coordination', 'photographe'] },
    { id: 'd-sax', nom: 'Devis du saxophoniste', type: 'Devis', de: 'sax', signe: true, montant: 650, visible: ['maries', 'coordination', 'musicien'] },
    { id: 'd-playlist', nom: 'Playlist de la soirée', type: 'Playlist', de: 'camille', visible: ['maries', 'coordination', 'dj'] },
    { id: 'd-invites', nom: 'Liste des invités et plan de table', type: 'Tableau', de: 'gabriel', visible: ['maries', 'coordination', 'traiteur', 'temoins'] },
    { id: 'd-programme', nom: 'Programme du jour', type: 'Programme', de: 'lea', visible: ['maries', 'coordination', 'temoins', 'officiant', 'traiteur', 'dj', 'musicien', 'photographe', 'lieu', 'invites'] }
  ],
  blocs: [
    { id: 'b-ceremonie', titre: 'La cérémonie', sous: 'L’officiant, les témoins, le saxophone', relie: ['j-ceremonie', 'aldo', 'ines', 'hugo', 'sax', 'r-repetition'] },
    { id: 'b-reception', titre: 'La réception', sous: 'Le lieu, le cocktail, le dîner', relie: ['j-cocktail', 'j-diner', 'phare', 'traiteur', 'd-lieu', 'd-traiteur'] },
    { id: 'b-musique', titre: 'La musique', sous: 'Le saxophone, le DJ, la playlist', relie: ['sax', 'dj', 'd-dj', 'd-sax', 'd-playlist', 'j-ouverture', 'j-soiree'] },
    { id: 'b-invites', titre: 'Les invités', sous: 'La liste, les régimes, le plan de table', relie: ['d-invites', 'r-regimes', 'r-plan-table', 'j-accueil'] },
    { id: 'b-memoire', titre: 'La mémoire', sous: 'La photographe, et ce qui restera', relie: ['photo', 'd-photo', 'j-photos', 'j-preparatifs'] },
    { id: 'b-budget', titre: 'Le budget', sous: 'Les devis, les contrats, les acomptes', relie: ['d-lieu', 'd-traiteur', 'd-dj', 'd-photo', 'd-sax'] }
  ],
  invites: [
    { nom: 'Inès', table: 1, regime: 'végétarien' }, { nom: 'Hugo', table: 1, regime: 'aucun' }, { nom: 'Aldo', table: 2, regime: 'sans gluten' },
    { nom: 'Marie', table: 2, regime: '' }, { nom: 'Paul', table: 3, regime: 'aucun' }, { nom: 'Sofia', table: 3, regime: '' }, { nom: 'Yanis', table: 4, regime: 'halal' }
  ],
  /* les modules d’ATLAS (data/modules.js) qu’un mariage appelle, et pour qui */
  modules: [
    { ref: 'timeline', pour: ['maries', 'coordination', 'temoins', 'dj', 'traiteur', 'musicien', 'photographe', 'officiant', 'lieu', 'invites'], relie: ['j-ceremonie', 'j-diner', 'j-soiree'] },
    { ref: 'agenda', pour: ['maries', 'coordination'], relie: ['r-traiteur', 'r-faire-part', 'r-repetition'] },
    { ref: 'invites', pour: ['maries', 'coordination', 'temoins', 'traiteur'], relie: ['d-invites', 'r-regimes'] },
    { ref: 'facture', pour: ['maries', 'coordination'], relie: ['d-traiteur', 'd-dj', 'd-lieu'] },
    { ref: 'musique', pour: ['maries', 'coordination', 'dj', 'musicien'], relie: ['d-playlist', 'j-ouverture', 'j-cocktail'] },
    { ref: 'documents', pour: ['maries', 'coordination'], relie: ['d-lieu', 'd-traiteur', 'd-dj', 'd-photo'] },
    { ref: 'missions', pour: ['maries', 'coordination', 'temoins'], relie: ['r-regimes', 'j-discours', 'j-accueil'] },
    { ref: 'galerie', pour: ['maries', 'photographe', 'invites'], relie: ['j-photos', 'photo'] }
  ]
};
