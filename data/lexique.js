/* Le lexique du moteur : les mots qu’il reconnaît dans une demande, en français.
   Les intentions reprennent les catégories mesurées dans data/statistiques.js (même id), pour que chaque
   demande reconstruite dise combien de gens demandent la même chose. Tout est en minuscules et sans accents
   à la comparaison ; on écrit ici les mots tels qu’on les dit. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.lexique = {
  /* ce que la personne veut : l’intention, d’après ses mots */
  intentions: {
    conseil: ['comment', 'conseil', 'conseille', 'conseiller', 'aide-moi', 'aidez-moi', 'apprendre', 'explique', 'expliquer', 'idee', 'idees', 'recommande', 'choisir', 'choisis', 'comparer', 'compare', 'organiser', 'organise', 'planifier', 'planifie', 'preparer', 'prepare', 'prevoir', 'que faire', 'quoi faire', 'astuce', 'methode', 'etapes'],
    ecriture: ['ecrire', 'ecris', 'ecrivez', 'rediger', 'redige', 'corriger', 'corrige', 'reformuler', 'reformule', 'traduire', 'traduis', 'resumer', 'resume', 'relire', 'relis', 'lettre', 'e-mail', 'email', 'mail', 'message', 'discours', 'texte', 'invitation', 'faire-part', 'remerciements', 'voeux', 'courrier', 'annonce', 'prevenir', 'previens', 'previenne', 'informer'],
    information: ['qu\'est-ce', 'quel', 'quelle', 'quels', 'quelles', 'combien', 'chercher', 'cherche', 'trouver', 'trouve', 'savoir', 'definition', 'prix', 'tarif', 'horaires', 'adresse', 'liste des', 'qui est', 'pourquoi', 'difference'],
    technique: ['code', 'bug', 'bugue', 'erreur', 'site', 'application', 'appli', 'excel', 'tableur', 'formule', 'installer', 'configurer', 'script', 'ordinateur', 'iphone', 'android', 'formulaire', 'base de donnees', 'calculer', 'calcule', 'automatiser', 'automatise'],
    image: ['image', 'photo', 'photos', 'logo', 'visuel', 'affiche', 'dessin', 'dessine', 'illustration', 'video', 'montage', 'couleurs', 'palette', 'patron', 'motif'],
    expression: ['je pense', 'je me demande', 'raconter', 'mon histoire', 'reflechir', 'poeme', 'slam', 'chanson', 'souvenir', 'souvenirs', 'sens', 'but', 'vocation'],
    soutien: ['stress', 'stresse', 'stressee', 'angoisse', 'anxieux', 'anxieuse', 'triste', 'peur', 'seul', 'seule', 'deprime', 'deprimee', 'dispute', 'deuil', 'fatigue', 'fatiguee', 'epuise', 'epuisee', 'dormir', 'motivation', 'confiance', 'j\'ai besoin de parler', 'je me sens', 'je n\'arrive plus']
  },

  /* la forme de la demande (OpenAI : demander, faire faire, s’exprimer) */
  formes: {
    faire: ['fais', 'faites', 'cree', 'creer', 'ecris', 'redige', 'prepare', 'genere', 'organise', 'trouve', 'corrige', 'traduis', 'envoie', 'reserve', 'dessine', 'calcule', 'construis', 'previens', 'il faut que', 'je veux', 'je voudrais', 'peux-tu', 'pouvez-vous'],
    exprimer: ['je me sens', 'je suis', 'j\'ai peur', 'j\'ai besoin de parler', 'je n\'arrive plus', 'je pense que']
  },

  /* les verbes conjugués et leur infinitif, pour reformuler « Écrire un discours » à partir de « écris-moi un discours » */
  infinitifs: {
    fais: 'faire', faites: 'faire', cree: 'créer', creez: 'créer', ecris: 'écrire', ecrivez: 'écrire', redige: 'rédiger', redigez: 'rédiger',
    prepare: 'préparer', preparez: 'préparer', genere: 'générer', organise: 'organiser', organisez: 'organiser', trouve: 'trouver', trouvez: 'trouver',
    corrige: 'corriger', corrigez: 'corriger', traduis: 'traduire', traduisez: 'traduire', envoie: 'envoyer', envoyez: 'envoyer', reserve: 'réserver',
    dessine: 'dessiner', calcule: 'calculer', construis: 'construire', previens: 'prévenir', prevenir: 'prévenir', explique: 'expliquer', expliquez: 'expliquer',
    resume: 'résumer', resumez: 'résumer', compare: 'comparer', choisis: 'choisir', cherche: 'chercher', cherchez: 'chercher', planifie: 'planifier',
    aide: 'aider', aidez: 'aider', relis: 'relire', reformule: 'reformuler', conseille: 'conseiller', automatise: 'automatiser', informe: 'informer',
    previenne: 'prévenir', fasse: 'faire', ecrive: 'écrire', trouve: 'trouver', appelle: 'appeler', appeler: 'appeler', reserver: 'réserver', ecrire: 'écrire', rediger: 'rédiger', preparer: 'préparer', organiser: 'organiser', trouver: 'trouver', corriger: 'corriger', traduire: 'traduire',
    creer: 'créer', faire: 'faire', choisir: 'choisir', comparer: 'comparer', planifier: 'planifier', calculer: 'calculer', chercher: 'chercher', envoyer: 'envoyer'
  },

  /* le moment : du plus proche au plus lointain (le rang sert à ordonner) */
  temps: [
    ['maintenant', 0], ['tout de suite', 0], ['urgent', 0], ['aujourd\'hui', 0], ['ce soir', 0], ['ce matin', 0],
    ['demain', 1], ['apres-demain', 2], ['cette semaine', 2], ['lundi', 2], ['mardi', 2], ['mercredi', 2], ['jeudi', 2], ['vendredi', 2], ['samedi', 2], ['dimanche', 2],
    ['week-end', 2], ['semaine prochaine', 3], ['ce mois', 3], ['mois prochain', 4],
    ['janvier', 4], ['fevrier', 4], ['mars', 4], ['avril', 4], ['mai', 4], ['juin', 4], ['juillet', 4], ['aout', 4], ['septembre', 4], ['octobre', 4], ['novembre', 4], ['decembre', 4],
    ['plus tard', 6], ['un jour', 6]
  ],

  /* les marques d’ordre que la personne emploie elle-même : elles passent avant tout */
  ordre: [
    ['d\'abord', 0], ['en premier', 0], ['avant tout', 0], ['premierement', 0], ['en priorite', 0],
    ['ensuite', 1], ['puis', 1], ['deuxiemement', 1], ['apres', 2], ['et aussi', 3], ['enfin', 8], ['pour finir', 8], ['en dernier', 9], ['si possible', 9]
  ],

  /* la forme du résultat attendu */
  formats: ['liste', 'tableau', 'page', 'pdf', 'e-mail', 'mail', 'lettre', 'plan', 'planning', 'calendrier', 'carte', 'resume', 'devis', 'affiche', 'discours', 'message', 'texte', 'site', 'image', 'presentation', 'checklist', 'faire-part', 'invitation'],

  /* les unités qui font d’un nombre une quantité */
  unites: ['invites', 'invite', 'personnes', 'personne', 'euros', 'euro', '€', 'eur', 'jours', 'jour', 'heures', 'heure', 'h', 'minutes', 'min', 'pages', 'page', 'mots', 'km', 'tables', 'places'],

  /* les lieux reconnus sans majuscule */
  lieux: ['salle', 'eglise', 'mairie', 'chateau', 'jardin', 'plage', 'restaurant', 'maison', 'bureau', 'domaine', 'gite', 'hotel'],

  /* ce qu’il faut demander quand l’élément manque, selon l’intention */
  manques: {
    conseil: ['contexte', 'conditions'],
    ecriture: ['pourqui', 'format', 'ton'],
    information: ['lieu', 'quand'],
    technique: ['contexte', 'quand'],
    image: ['format', 'pourqui'],
    expression: [],
    soutien: []
  },
  questions: {
    pourqui: 'Pour qui, ou à qui est-ce destiné ?',
    quand: 'Pour quand ?',
    lieu: 'Où ?',
    format: 'Sous quelle forme voulez-vous le résultat (liste, texte, tableau…) ?',
    ton: 'Sur quel ton : tendre, drôle, solennel ?',
    contexte: 'Que s’est-il passé jusqu’ici, qu’avez-vous déjà essayé ?',
    conditions: 'Qu’est-ce qui compte le plus : le budget, le temps, la simplicité ?'
  }
};
