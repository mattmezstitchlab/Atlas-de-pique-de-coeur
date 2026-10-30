/* Les modules : les fonctionnalités recréées le plus souvent, devenues des blocs vivants de la Métamorphose.
   Chacun vient de ce qui a été répété : les capacités de l’application « Atlas Base44 Matt Mez » (entité Capability, 28 fiches)
   et les noms des 643 applications (data/applications.js). « apps » compte les applications dont le nom porte le mot,
   « motif » est l’expression cherchée dans ces noms. Les modules gardent leurs données sur cet appareil.
   Reliés, ils partagent ce qu’ils savent : les moments de la Timeline paraissent dans l’Agenda, un montant part à la Facture,
   un cachet compte pour l’intermittence. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.modules = [
  { id: 'timeline', titre: 'Timeline', famille: 'temps', w: 4, h: 5,
    role: 'Les moments dans l’ordre, avec leur heure : la journée, le projet, une vie.',
    motif: /timeline|chrono/i, exemples: ['AIME Timeline', 'Timeline du Mariage by AIME®', 'ChronoCircle', 'Chronos'],
    capacites: ['Timeline interactive', 'Planning avec plans B', 'Timeline unifiée par couches'] },
  { id: 'agenda', titre: 'Agenda', famille: 'temps', w: 4, h: 6,
    role: 'Le mois en jours : on voit ce qui est pris, on pose un moment d’un toucher.',
    motif: /agenda|calend|planning|planner|booking|r[ée]serv/i, exemples: ['ONE BOOKING', 'Wedding Planner', 'Matt Mez Sax - Booking & Events', 'Calendly'],
    capacites: ['Système de réservation'] },
  { id: 'facture', titre: 'Facture', famille: 'demarches', w: 4, h: 5,
    role: 'Des lignes, un total : le devis devient facture, sans ressaisir.',
    motif: /factur|devis|invoice/i, exemples: [],
    capacites: ['Générateur de devis', 'Paiement sécurisé', 'Contrats et annulations mariage'] },
  { id: 'intermittent', titre: 'Intermittent', famille: 'musique', w: 4, h: 4,
    role: 'Les cachets comptés en heures, jusqu’aux 507 heures : le régime des artistes et techniciens du spectacle.',
    motif: /cachet|intermitt|spectacle/i, exemples: ['AIME Cachet', 'AIME Cachet OS', 'Sandrine Sarroche Spectacles'],
    capacites: [],
    regle: 'Annexes 8 et 10 de l’assurance chômage : 507 heures sur 12 mois ; un cachet compte pour 12 heures.' },
  { id: 'documents', titre: 'Documents', famille: 'demarches', w: 4, h: 4,
    role: 'Contrats, devis, notices : chaque pièce a son état, et les modules reliés y déposent les leurs.',
    motif: /document|dossier|contrat|notice/i, exemples: ['CONTRAT CLAIR — L’Agent Gardien', 'Notice', 'AgriDossier Copilot'],
    capacites: ['Gestion documentaire', 'Contrats et annulations mariage'] },
  { id: 'invites', titre: 'Invités', famille: 'mariage', w: 4, h: 5,
    role: 'Qui vient, qui ne vient pas, qui n’a pas répondu : la liste qui fait la table.',
    motif: /invit|guest|rsvp/i, exemples: [],
    capacites: ['Profil enrichi des invités', 'Missions collaboratives du mariage', 'Galerie collaborative des invités'] }
];
