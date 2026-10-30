/* L’histoire de l’écosystème AIME, chapitre par chapitre.
   Chaque chapitre devient une section de la page et un lieu du dock du bas.
   Un moment : { quand, titre, texte, puces?, source? }. Un visuel : { src, alt, accroche, legende }.
   « bandeau » : l’identifiant d’un visuel de data/visuels.js, posé en grand avant le chapitre, le titre en blanc dessus.
   Sources : les dates de création des 643 applications Base44 du compte (API Base44, relevé du 30 octobre 2026),
   l’application « Atlas Base44 Matt Mez » (171 fiches, 28 capacités), l’historique git d’Aime-wedding et de LEMONDEAIME,
   l’archive « AIME PROJETS.zip ». Ne rien inventer : une date sans source n’entre pas ici. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.histoire = {
  chiffres: [
    ['643', 'applications Base44 en un an'],
    ['171', 'fiches dans l’atlas Base44'],
    ['138', 'dépôts GitHub'],
    ['28', 'capacités réutilisables']
  ],
  chapitres: [
    {
      id: 'novembre', bandeau: 'union', lieu: 'Novembre', date: '10 – 30 novembre 2025 · 99 applications', titre: 'Le premier soir',
      chapeau: 'Le 10 novembre 2025, à 17 h 53, une première application : « Rainbow Synchronicity ». En vingt jours, quatre-vingt-dix-neuf autres suivent. Les thèmes de tout ce qui viendra sont déjà là : le mariage, la musique, la mémoire, la broderie.',
      moments: [
        { quand: '10 nov.', titre: 'Signature Vibratoire',
          texte: 'Le premier soir : Rainbow Synchronicity, puis cinq versions de Signature Vibratoire en quatre heures, MSA LAB et VYBZ.',
          puces: ['Rainbow Synchronicity', 'Signature Vibratoire ×5', 'MSA LAB', 'VYBZ'], source: 'Base44, dates de création' },
        { quand: '11 nov.', titre: 'Le mariage entre en scène',
          texte: 'Six versions de Mariage Vibratoire dans la journée, Mariage Invisible, puis WENDY®, « The Conscious Wedding Conductor » : la première application qui orchestre un mariage.',
          puces: ['Mariage Vibratoire ×6', 'Mariage Invisible®', 'WENDY®'], source: 'Base44, dates de création' },
        { quand: '12 – 14 nov.', titre: 'La mémoire, l’artiste, les démarches',
          texte: 'SOLUX, la partition du vivant ; Philippe de Comines, mémoire vivante ; Circle of Life ; ARTYST®, le passeport numérique universel de l’artiste ; et trois flux administratifs, AGRI-FLOW, ADMIN-FLOW et TICKET-FLOW.',
          puces: ['SOLUX', 'Philippe de Comines', 'CIRCLE OF LIFE', 'EVENTIA', 'ONE', 'ARTYST®', 'AGRI-FLOW'], source: 'Base44, dates de création' },
        { quand: '14 – 30 nov.', titre: 'L’univers du saxophone',
          texte: 'Un musée des saxophones, une boutique, un puzzle en 3D, puis le diagnostic, les pièces et la construction d’un instrument.',
          puces: ['SAXMUSEOM', 'SAX-SHOP', 'Saxo-Puzzle 3D', 'SaxDiag', 'SaxParts', 'SAX∞', 'SAFE-SAX® 3D'], source: 'Base44, dates de création' },
        { quand: '15 – 25 nov.', titre: 'Le point de croix, déjà',
          texte: 'Point de Croix Creator et Stitch Universe le 15 ; neuf versions de PATY en dix jours ; puis, le 24, SUB, le Système Universel de Broderie, signé LECOINTRE. La broderie de Point Zéro commence ici.',
          puces: ['Point de Croix Creator', 'Stitch Universe', 'PATY ×9', 'SUB', 'SUB-ID™'], source: 'Base44, dates de création' },
        { quand: '28 – 29 nov.', titre: 'LUMINA',
          texte: 'Le nom qui reviendra jusqu’en octobre 2026 : LUMINA, puis Lumina : le DPE humain®.',
          puces: ['LUMINA', 'Lumina Real Estate', 'Lumina : Le DPE Humain®'], source: 'Base44, dates de création' }
      ]
    },
    {
      id: 'decembre', bandeau: 'sculpture', lieu: 'Décembre', date: 'Décembre 2025 · 103 applications', titre: 'Le nom AIME',
      chapeau: 'Le laboratoire prend un nom, Matt Mez Lab, le 6 décembre. Deux semaines plus tard, le 20, apparaît pour la première fois le mot AIME : AIME Magazine.',
      moments: [
        { quand: '6 déc.', titre: 'Matt Mez Lab',
          texte: 'Le laboratoire qui portera tout le reste reçoit son nom.', source: 'Base44, date de création' },
        { quand: '12 déc.', titre: 'La mémoire et la solidarité',
          texte: 'Le même jour : Mémoire Vive, Mariage Vivant, La Ch’tite Maison Solidaire, Parcours de Guérison Transgénérationnelle, et SAXXX, la plateforme mondiale du saxophone.',
          puces: ['Mémoire Vive', 'Mariage Vivant', 'La Ch’tite Maison Solidaire', 'SAXXX'], source: 'Base44, dates de création' },
        { quand: '14 – 18 déc.', titre: 'Des gardiens',
          texte: '1001 VISAGES ; CONTRAT CLAIR, l’agent gardien ; MAESTRO ; Presence Palliative Care ; CLASSEUR, le cerveau administratif des Français.',
          puces: ['1001 VISAGES', 'CONTRAT CLAIR', 'MAESTRO', 'CLASSEUR'], source: 'Base44, dates de création' },
        { quand: '20 déc.', titre: 'AIME Magazine',
          texte: 'La première application qui porte le nom AIME, suivie le même jour d’AIME Canvas. Sept versions d’AIME Magazine en une semaine.',
          puces: ['AIME Magazine', 'AIME Canvas'], source: 'Base44, dates de création' },
        { quand: '25 – 31 déc.', titre: 'Noël AIME',
          texte: 'Le 25 : AIME JOURNAL, AIME Magazine Foundation, AIME Web Magazine IA et AIME Studio. Le 31 : AIME Sortir.',
          puces: ['AIME JOURNAL', 'AIME Studio', 'Sax Loop Orchestra', 'AIME Sortir'], source: 'Base44, dates de création' }
      ]
    },
    {
      id: 'hiver', bandeau: 'sous-la-mer', lieu: 'Janv. – mars', date: 'Janvier – mars 2026 · 128 applications', titre: 'Le Monde AIME',
      chapeau: 'AIME se décline, puis s’élargit : le 15 janvier naît LE MONDE AIME. Le temps devient une matière (Timeheart, Time Circle) et la présence une forme (BLOOM).',
      moments: [
        { quand: '11 janv.', titre: 'AI + ME',
          texte: 'Cinq applications AIME en une journée, et une qui décompose le nom : AI+ME J0.',
          puces: ['AIME ×5', 'AI+ME J0'], source: 'Base44, dates de création' },
        { quand: '15 janv.', titre: 'LE MONDE AIME',
          texte: 'Le nom du site officiel apparaît pour la première fois, deux fois dans la même nuit.', source: 'Base44, dates de création' },
        { quand: '17 – 25 janv.', titre: 'Le temps du mariage',
          texte: 'Lille Mariage, Mariage Connect, WeddingMatch ; puis Timeheart, Time Circle et Five Become One.',
          puces: ['Timeheart', 'AIME&M’s', 'Time Circle', 'Five Become One'], source: 'Base44, dates de création' },
        { quand: '27 – 29 janv.', titre: 'BLOOM',
          texte: 'Dix versions de BLOOM en trois jours, jusqu’à « BLOOM — Oracle of Presence » ; et CrossStitch AR, la broderie en réalité augmentée.',
          puces: ['BLOOM', 'Oracle of Presence', 'CrossStitch AR', 'PatternStudio', 'Place Publique'], source: 'Base44, dates de création' },
        { quand: '31 janv. – 2 févr.', titre: 'BIRD',
          texte: 'Sept versions de BIRD, dont un compositeur visuel Bauhaus, puis deux Le Monde Aime. Ensuite, six semaines de silence.',
          source: 'Base44, dates de création' },
        { quand: '17 – 31 mars', titre: 'La reprise',
          texte: 'Matt Mez Sax Manager, Cérémonial, Lumina, puis le 31 mars AIME®, avec le symbole.',
          puces: ['Cérémonial', 'Lumina', 'AIME®'], source: 'Base44, dates de création' }
      ]
    },
    {
      id: 'avril', bandeau: 'laverie', lieu: 'Avril', date: 'Avril 2026 · 100 applications', titre: 'Apprendre des autres',
      chapeau: 'Avril est un mois d’étude : des dizaines de sites de référence sont reconstitués pour comprendre comment ils sont faits (Linear, Runey, Perplexity, Webflow, The Knot, Shopify, Awwwards…). AIME en sort avec ses outils de mariage.',
      moments: [
        { quand: '14 avr.', titre: 'La timeline du mariage',
          texte: 'AIME Events, AIME Timeline et Lumière Wedding, le même matin.', source: 'Base44, dates de création' },
        { quand: '17 avr.', titre: 'Cerise et A·I·M·E',
          texte: 'Cerise — App, dont viendra Timeline Cerise ; et A·I·M·E, le nom épelé.', source: 'Base44, dates de création' },
        { quand: '19 – 22 avr.', titre: 'Les Wedding OS',
          texte: 'AIME Living Editorial et AIME Mariage le 19 ; Lumina Wedding OS et Aura Wedding OS le 22.',
          puces: ['AIME Living Editorial', 'AIME Mariage', 'Lumina Wedding OS', 'Aura Wedding OS'], source: 'Base44, dates de création' },
        { quand: '26 – 27 avr.', titre: 'AIME Stamp et AIME® WEDDING',
          texte: 'AIME Architecte le 26 ; AIME Stamp dans la nuit, puis AIME® WEDDING le 27 au soir : la preuve de présence et le mariage.',
          source: 'Base44, dates de création' }
      ]
    },
    {
      id: 'mai', bandeau: 'grille-roses', lieu: 'Mai', date: 'Mai 2026 · 61 applications', titre: 'Le Point',
      chapeau: 'Mai donne une forme aux idées : un prototype de plateforme du mariage, un registre de preuves, la timeline du Jour J, et le 31, Point Zéro by AIME.',
      moments: [
        { quand: '6 mai', titre: 'Univers AIME, le prototype AIME PRO',
          texte: 'Une plateforme d’orchestration du mariage en trois portails (couples, invités, prestataires), prototypée en une page HTML.',
          puces: ['Couples', 'Invités', 'Prestataires'], source: 'AIME PROJETS.zip › UNIVER AIME' },
        { quand: '13 – 16 mai', titre: 'StitchLab et le registre',
          texte: 'StitchLab le 13 ; AIME® Stamp Registry le 16, des preuves de présence lisibles et partageables.', source: 'Base44, dates de création' },
        { quand: '18 mai', titre: 'Timeline du Mariage by AIME®', texte: 'La journée racontée moment par moment.', source: 'Base44, date de création' },
        { quand: '20 – 25 mai', titre: 'AIME Cachet, AIME DJ, StitchLab IA',
          texte: 'Le cachet, la musique du Jour J et la broderie assistée.', puces: ['AIME Cachet', 'AIME DJ', 'StitchLab IA', 'AIME Cachet OS'], source: 'Base44, dates de création' },
        { quand: '26 – 31 mai', titre: 'L’Éden',
          texte: 'Éden Plan, Éden Mont Noir, L’Éden du Brunch, L’Éden — Carte des Sorties, L’Eden Musical ; et Atlas Live le 29.',
          source: 'Base44, dates de création' },
        { quand: '31 mai', titre: 'Point Zéro by AIME', texte: 'Le nom de Point Zéro est posé.', source: 'Base44, date de création' }
      ]
    },
    {
      id: 'juin', bandeau: 'fondateur', lieu: 'Juin', date: 'Juin 2026 · 66 applications', titre: 'L’atlas',
      chapeau: 'Juin rassemble. Les portfolios et les marques sont reconstruits, et le 29 juin naît l’Atlas : la carte de tout ce qui a été fait, pour que rien ne se perde et que tout serve.',
      moments: [
        { quand: '2 – 5 juin', titre: 'Maison Mémoire, Notice, AccessiAudit',
          texte: 'La transmission, la lecture simple, l’accessibilité ; et Point Zéro Admin le 5.', source: 'Base44, dates de création' },
        { quand: '8 juin', titre: 'Matt Mez Lab',
          texte: 'L’application dont sera cloné, le 23 juillet, le portail Aime-wedding.', source: 'Base44 (6a26f7e7…) et premier commit d’Aime-wedding' },
        { quand: '9 – 15 juin', titre: 'SLÂME, AIME Chronograph, Coloria',
          texte: 'La voix comme mémoire choisie, le temps de l’événement, le coloriage partagé.', source: 'Base44, dates de création' },
        { quand: '25 – 28 juin', titre: 'AIME Booking, PointZero, Artistry',
          texte: 'AIME Booking et PointZero le 25 ; SaxBooking le 26 ; Artistry le 27 ; radioscan-ai le 28.', source: 'Base44, dates de création' },
        { quand: '29 juin', titre: 'Atlas Base44 Matt Mez',
          texte: 'L’atlas range chaque projet dans sa famille et sa filiation (idée mère, branche, copie, évolution), dit ce qu’il faut en sauver et en tire des capacités réutilisables. À partir d’une phrase (« un site de photographe »), il compose le plan d’un nouveau projet avec ce qui existe déjà.',
          puces: ['171 fiches projet', '28 capacités', '8 plans', '11 familles'], source: 'Base44, application Atlas Base44 Matt Mez' }
      ]
    },
    {
      id: 'juillet', bandeau: 'collection-forets', lieu: 'Juillet', date: 'Juillet 2026 · 41 applications', titre: 'Le cockpit',
      chapeau: 'Le mariage devient un cockpit vivant, l’écosystème un monde (AIME WORLD OS, AIME® ORBIT), et le portail Aime-wedding passe sur GitHub.',
      moments: [
        { quand: '3 – 21 juil.', titre: 'AIME® Wedding, le cockpit intelligent',
          texte: 'AIME WEDDING OFFICIEL le 3, puis huit versions du cockpit de mariage jusqu’au 21.', source: 'Base44, dates de création' },
        { quand: '13 – 15 juil.', titre: 'La grille et le monde',
          texte: 'AIME® GRID, LE MONDE AIME — RELATION OS, AIME WORLD OS et Point Zéro — The Causal Grid.',
          puces: ['AIME® GRID', 'RELATION OS', 'AIME WORLD OS', 'The Causal Grid'], source: 'Base44, dates de création' },
        { quand: '17 – 21 juil.', titre: 'L’édition vivante du Jour J',
          texte: 'BANKOSYSTÈME, AIME LIVE, AIME® ORBIT, MUSIC PATH, L’Atelier des Vœux, AIME® LIEU, puis le 21 : L’ÉDITION VIVANTE DU JOUR J.',
          source: 'Base44, dates de création' },
        { quand: '23 juil.', titre: 'Le portail sur GitHub',
          texte: 'Aime-wedding est cloné depuis Matt Mez Lab ; en deux jours, plus de soixante-dix itérations : atlas, magazine, passeport vivant, registre, Gardien.',
          source: 'Aime-wedding, historique git' },
        { quand: '28 juil.', titre: 'Trois projets mis en archive, Point Zéro dans le studio',
          texte: 'Le Clavier Causal, Timeline Cerise et Univers AIME sont rangés ensemble ; l’atelier Point Zéro reçoit son premier commit.',
          source: 'LEMONDEAIME › AIME PROJETS.zip, studio/' }
      ],
      visuels: [
        { src: 'media/broderie.jpg', alt: 'Une brodeuse tient une tablette avec une grille et un tambour brodé de roses', accroche: 'Point Zéro', legende: 'Créer le patron et le broder' },
        { src: 'media/union-camille-gabriel.jpg', alt: 'Un couple danse sous les étoiles devant un motel du désert', accroche: 'Le mariage', legende: 'Le terrain de démonstration' }
      ]
    },
    {
      id: 'aout', bandeau: 'facade', lieu: 'Août – sept.', date: 'Août – septembre 2026 · 32 applications', titre: 'Les quatre projets',
      chapeau: 'En août, l’écosystème est remis à plat en quatre projets nommés par des lettres ; HERA naît le 16. Puis le travail passe sur GitHub.',
      moments: [
        { quand: '10 – 11 août', titre: 'Lumina et GAÏA',
          texte: 'Lumina Wedding, AIME Wedding Canvas, puis GAÏA et LE MONDE AIME.', source: 'Base44, dates de création' },
        { quand: '13 – 14 août', titre: 'Projets A, B, C, D',
          texte: 'PROJET A, origine et legacy ; PROJET B, studio agentique ; PROJET C, Le Monde AIME ; PROJET D, timeline du Jour J.',
          puces: ['A · origine', 'B · studio agentique', 'C · Le Monde AIME', 'D · timeline Jour J'], source: 'Base44, dates de création' },
        { quand: '16 – 17 août', titre: 'HERA et la Cité du Vivant',
          texte: 'HERA, la musique du mariage reliée à la mémoire ; AIME — Cité du Vivant ; AIME — LE GRAND JOUR.', source: 'Base44, dates de création' },
        { quand: 'Août – sept.', titre: 'Sur GitHub',
          texte: 'Les magazines du mariage, les coffrets, la carte du monde, la broderie universelle, PACTE et SYSTEMATLAS prennent la forme de dépôts.',
          puces: ['WORLD WEDDING MAGAZINE', 'COFFRET WEDDING', 'UNIVERSAL BRODERIE', 'PACTE', 'SYSTEMATLAS'], source: 'GitHub, derniers envois des dépôts' },
        { quand: '29 sept.', titre: 'Lumina Wedding OS', texte: 'Le retour de Lumina, en système complet du mariage.', source: 'Base44, date de création' }
      ]
    },
    { id: 'ecosysteme', bandeau: 'scene', lieu: 'L’écosystème', date: '2026 · état déclaré', titre: 'L’écosystème', projets: true,
      chapeau: 'Dix-neuf projets, une même architecture : relier les personnes, les événements, les mémoires et les relais.' },
    {
      id: 'octobre', bandeau: 'dessiner', lieu: 'Octobre', date: 'Octobre 2026 · 13 applications', titre: 'Octobre',
      chapeau: 'New York Wedding OS ouvre le mois ; lemondeaime.com sort en une journée le 28 ; le lendemain, la charte devient un design system et l’atlas une page.',
      moments: [
        { quand: '1er oct.', titre: 'NEW YORK WEDDING OS', texte: 'Avec L’Atelier des Noces et AIMEWEDDINGMEMORY, le même jour ; World Grid le 3.', source: 'Base44, dates de création' },
        { quand: '28 oct.', titre: 'Première version de lemondeaime.com', texte: 'AIME, Le Monde AIME, Point Zéro, le BurO et la Charte AIME. Les fonctions tournent à Francfort, près de la base Neon, dans l’Union européenne.', source: 'PR #1' },
        { quand: '28 oct.', titre: 'Entrer, le Réseau, l’atelier', texte: 'Connexion par Google, clé d’accès ou e-mail ; le Réseau et les profils ; Point Zéro sous /studio/.', source: 'PR #2 à #4' },
        { quand: '28 oct.', titre: 'Les docks, la Boutique et la Métamorphose', texte: 'Les verbes en haut, les lieux en bas. Mon confort tient sur une ligne du dock.', puces: ['Docks', 'Boutique', 'Métamorphose', 'Mon confort'], source: 'PR #5 à #9' },
        { quand: '28 oct.', titre: 'Les cartes, la musique, la sécurité', texte: 'Cartes qui se retournent, la journée en musique, suppression de compte complète.', source: 'PR #10 à #19' },
        { quand: '29 – 30 oct.', titre: 'Le design system et l’Atlas de pique de cœur', texte: 'La Charte AIME devient un design system ; l’atlas et le moteur en sont la première application.' }
      ],
      visuels: [
        { src: 'media/fils.jpg', alt: 'L’atelier Point Zéro : une initiale A brodée de roses, avec la palette des fils DMC dans le dock du bas', accroche: 'Le StudiO', legende: 'L’atelier dans le site' },
        { src: 'media/grille-roses.jpg', alt: 'Un bouquet de roses brodé sur une toile écrue', accroche: 'Point Zéro · l’étape 0', legende: 'On part du centre' }
      ]
    }
  ],
  demain: {
    id: 'demain', bandeau: 'wagon', lieu: 'Demain', date: 'Après le 30 octobre 2026', titre: 'Demain',
    chapeau: 'La suite proposée dans la cartographie de l’écosystème. Proposée, pas encore engagée : chaque étape attend sa validation.',
    etapes: [
      ['Recette des domaines et des noms', 'Avec de vrais utilisateurs ; fil d’Ariane et source Point Zéro, sans toucher aux moteurs.'],
      ['Des contrats communs', 'Préférences de design partagées, modèles complets, captures avant et après. Pas de refonte spéculative.'],
      ['Archive, restauration et registre des œuvres', 'Auteurs, contributeurs, versions, licences et parts, avec validation des schémas avant toute persistance.'],
      ['Un premier connecteur', 'D’abord fichier et ICS, puis Drive si c’est autorisé ; identité et coffre de secrets côté serveur.'],
      ['Invitations et permissions', 'Partager et révoquer pour de vrai, et publier seulement après l’infrastructure, la sécurité et le budget approuvés.'],
      ['La production, sur validation', 'Chaque pull request validée, recettée, compatible avec les données existantes.']
    ],
    horizon: [
      ['Architecture', 'AIME Continuum', 'Toute situation complexe devient un passeport vivant, causal, spatial et probant.'],
      ['Bientôt', 'A+', 'L’espace des professionnels sur lemondeaime.com.'],
      ['Bientôt', 'Contact et presse', 'Annoncé dans le pied de page du site.']
    ]
  }
};
