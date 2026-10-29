/* Ce que les gens demandent aux agents IA, et ce qu’ils veulent en faire.
   Recherche web du 29 octobre 2026. Chaque chiffre porte sa source ; quand les comptes rendus divergent,
   on garde l’écart (min – max) au lieu de choisir. Les études mesurent des usages différents : ne pas les additionner. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.statistiques = {
  sources: {
    openai: { nom: 'OpenAI et NBER, « How People Use ChatGPT »', quand: 'sept. 2025, messages jusqu’à juillet 2025', base: '1,5 million de conversations grand public', lien: 'https://cdn.openai.com/pdf/a253471f-8260-40c6-a2cc-aa93fe9f142e/economic-research-chatgpt-usage-paper.pdf' },
    anthropic: { nom: 'Anthropic, « How people use Claude for support, advice, and companionship »', quand: 'juin 2025', base: '4,5 millions de conversations Claude.ai', lien: 'https://www.anthropic.com/research/how-people-use-claude-for-support-advice-and-companionship' },
    anthropicEco: { nom: 'Anthropic Economic Index', quand: 'rapport de mars 2026 (données de février 2026)', base: 'conversations Claude.ai', lien: 'https://anthropic.com/research/economic-index-march-2026-report' },
    microsoft: { nom: 'Microsoft, « The Copilot Usage Report 2025 »', quand: 'déc. 2025, janvier à septembre 2025', base: '37,5 millions de conversations', lien: 'https://news.microsoft.com/source/emea/2025/12/its-about-time-the-copilot-usage-report-2025/' },
    pew: { nom: 'Pew Research Center', quand: '2025, selon la presse', base: 'sondage d’adultes américains', lien: 'https://wjla.com/news/nation-world/americans-embrace-ai-but-with-skeptical-eye-pew-survey-shows' },
    stanford: { nom: 'Stanford, « Future of Work with AI Agents » (WORKBank)', quand: 'juin 2025', base: '1 500 travailleurs, 104 métiers, 844 tâches, 52 experts', lien: 'https://futureofwork.saltlab.stanford.edu' },
    hbr: { nom: 'Harvard Business Review et Filtered, « Top 100 Gen AI Use Cases 2025 »', quand: 'mars 2025', base: 'discours publics (Reddit, Quora…), non scientifique', lien: 'https://learn.filtered.com/hubfs/The%202025%20Top-100%20Gen%20AI%20Use%20Case%20Report.pdf' }
  },

  /* 1. Ce que les gens demandent, mesuré : la part des messages ChatGPT par sujet (OpenAI). */
  demandes: [
    { id: 'conseil', nom: 'Conseil pratique', exemple: 'apprendre, savoir comment faire, trouver des idées', min: 28.8, max: 29, source: 'openai' },
    { id: 'ecriture', nom: 'Écrire', exemple: 'e-mails, documents, retouches, traductions', min: 24, max: 28.3, source: 'openai', note: 'Deux demandes d’écriture sur trois portent sur un texte déjà écrit (corriger, critiquer, traduire).' },
    { id: 'information', nom: 'Chercher une information', exemple: 'à la place d’un moteur de recherche', min: 21.3, max: 24, source: 'openai', note: 'En hausse : environ 14 % au début de la période.' },
    { id: 'technique', nom: 'Aide technique', exemple: 'code, logiciels, calculs', min: 5, max: 7.5, source: 'openai', note: 'La programmation seule : 4,2 % des messages.' },
    { id: 'image', nom: 'Images et multimédia', exemple: 'créer ou analyser une image', min: 6, max: 7, source: 'openai' },
    { id: 'expression', nom: 'S’exprimer', exemple: 'réfléchir à voix haute, jouer, se raconter', min: 2.4, max: 4.3, source: 'openai' },
    { id: 'soutien', nom: 'Soutien et émotions', exemple: 'conseil personnel, santé mentale, relations', min: 2.9, max: 2.9, source: 'anthropic', note: 'Compagnie et jeu de rôle : moins de 0,5 %. Mesuré sur Claude, pas sur ChatGPT.' }
  ],

  /* 2. La forme de la demande (OpenAI) : demander, faire faire, s’exprimer. */
  formes: [
    { nom: 'Demander', texte: 'une information, un avis, une explication', part: 49 },
    { nom: 'Faire faire', texte: 'un texte, un plan, un code, une image', part: 40 },
    { nom: 'S’exprimer', texte: 'sans attendre de résultat', part: 11 }
  ],

  /* 3. Ce qui ressort aussi, ailleurs. */
  reperes: [
    { chiffre: '73 %', texte: 'des messages ChatGPT n’ont rien à voir avec le travail.', source: 'openai' },
    { chiffre: '40 %', texte: 'des messages de travail sur ChatGPT servent à écrire.', source: 'openai' },
    { chiffre: '35 %', texte: 'des conversations Claude.ai portent sur l’informatique et les mathématiques.', source: 'anthropicEco' },
    { chiffre: 'n° 1', texte: 'La santé est le premier sujet sur téléphone, à chaque heure et chaque mois observés ; le travail domine sur ordinateur de 8 h à 17 h.', source: 'microsoft' },
    { chiffre: '49 %', texte: 'des adultes américains utilisent un agent conversationnel ; 42 % s’en servent pour chercher une information.', source: 'pew' }
  ],

  /* 4. Ce que les gens veulent en faire (Stanford, WORKBank). */
  envies: [
    { chiffre: '46,1 %', texte: 'des tâches : les travailleurs veulent qu’un agent les automatise.', source: 'stanford' },
    { chiffre: '69,4 %', texte: 'de ceux qui le veulent donnent la même raison : libérer du temps pour ce qui compte.', source: 'stanford' },
    { chiffre: '45,2 %', texte: 'des métiers préfèrent un partenariat égal entre la personne et l’agent (niveau H3 sur 5).', source: 'stanford' },
    { chiffre: '41,0 %', texte: 'des jeunes pousses de Y Combinator visent des tâches que personne ne demande ou que les travailleurs refusent.', source: 'stanford' }
  ],

  /* 5. L’ordre inversé : ce dont on parle le plus contre ce qui est mesuré le moins.
     Rang « discours » : HBR et Filtered 2025 (ce que les gens racontent faire avec l’IA).
     Part « mesurée » : la part des conversations réellement observée dans les études ci-dessus. */
  inverse: [
    { rang: 1, nom: 'Soutien, thérapie et compagnie', mesure: '2,9 % des conversations Claude ; compagnie < 0,5 %', source: 'anthropic' },
    { rang: 2, nom: 'Organiser sa vie', mesure: 'compris dans le conseil pratique (≈ 29 %), sans part propre', source: 'openai' },
    { rang: 3, nom: 'Trouver un sens, un but', mesure: 'compris dans « s’exprimer » (2,4 à 4,3 %)', source: 'openai' }
  ]
};
