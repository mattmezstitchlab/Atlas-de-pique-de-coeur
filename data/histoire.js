/* L’histoire de l’écosystème AIME, chapitre par chapitre.
   Chaque chapitre devient une section de la page et un lieu du dock du bas.
   Un moment : { quand, titre, texte, puces?, source? }. Un visuel : { src, alt, accroche, legende }.
   Dates et faits : historique git d’Aime-wedding et de LEMONDEAIME, archive « AIME PROJETS.zip ». Ne rien inventer. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.histoire = {
  chiffres: [
    ['19', 'projets dans l’écosystème'],
    ['126', 'commits sur deux dépôts'],
    ['14', 'pull requests le 28 octobre'],
    ['6', 'étapes pour demain']
  ],
  chapitres: [
    {
      id: 'avant', lieu: 'Avant', date: 'Mai 2026', titre: 'Avant',
      chapeau: 'Avant le site, une idée tenue dans une seule page : orchestrer un mariage pour ceux qui le font vivre, les mariés, les invités, les prestataires.',
      moments: [
        { quand: '6 mai', titre: 'Univers AIME, le prototype AIME PRO',
          texte: 'Une plateforme d’orchestration du mariage en trois portails (couples, invités, prestataires), prototypée en une page HTML, puis posée sur une base SaaS en React 19.',
          puces: ['Couples', 'Invités', 'Prestataires'], source: 'AIME PROJETS.zip › UNIVER AIME' }
      ]
    },
    {
      id: 'juillet', lieu: 'Juillet', date: '23 – 28 juillet 2026', titre: 'Juillet',
      chapeau: 'Six jours pour poser les fondations : le portail Matt Mez Lab, l’atlas des projets, le passeport vivant, et les premiers ateliers.',
      moments: [
        { quand: '23 juil.', titre: 'Le portail AIME naît de Matt Mez Lab',
          texte: 'Le portail principal et l’atlas des projets de l’écosystème, construits sur Base44. Il relie AIME Édition et le Passeport AIME.',
          source: 'Aime-wedding, premier commit' },
        { quand: '26 – 27 juil.', titre: 'Deux jours, plus de soixante-dix itérations',
          texte: 'Le portail se remplit : l’atlas et le magazine, le passeport vivant, le registre AIME, le studio des tampons, le Gardien AIME, l’espace du créateur et le système AIME.',
          puces: ['Atlas', 'Magazine', 'Passeport vivant', 'Registre AIME', 'Stamp Studio', 'Gardien AIME', 'Système AIME'], source: 'Aime-wedding/src/pages' },
        { quand: '28 juil.', titre: 'Trois projets mis en archive, Point Zéro commence',
          texte: 'Le Clavier Causal (un mariage de 148 invités piloté au clavier), Timeline Cerise (le pilotage des dossiers universels) et Univers AIME sont rangés ensemble. Le même jour, l’atelier de point de croix Point Zéro reçoit son premier commit.',
          puces: ['Ripple · Clavier Causal', 'Timeline Cerise', 'Univers AIME', 'Point Zéro'], source: 'LEMONDEAIME › AIME PROJETS.zip, studio/' }
      ],
      visuels: [
        { src: 'media/broderie.jpg', alt: 'Une brodeuse tient une tablette avec une grille et un tambour brodé de roses', accroche: 'Point Zéro', legende: 'Créer le patron et le broder' },
        { src: 'media/union-camille-gabriel.jpg', alt: 'Un couple danse sous les étoiles devant un motel du désert', accroche: 'Le mariage', legende: 'Le terrain de démonstration' }
      ]
    },
    { id: 'ecosysteme', lieu: 'L’écosystème', date: '2026 · état déclaré', titre: 'L’écosystème', projets: true,
      chapeau: 'Dix-neuf projets, une même architecture : relier les personnes, les événements, les mémoires et les relais.' },
    {
      id: 'octobre', lieu: 'Octobre', date: '28 – 29 octobre 2026', titre: 'Octobre',
      chapeau: 'lemondeaime.com sort en une journée : quatorze pull requests, du premier compte à la musique du Jour J. Le lendemain, la charte devient un design system.',
      moments: [
        { quand: '28 oct.', titre: 'Première version de lemondeaime.com', texte: 'AIME, Le Monde AIME, Point Zéro, le BurO et la Charte AIME. Les fonctions tournent à Francfort, près de la base Neon, dans l’Union européenne.', source: 'PR #1' },
        { quand: '28 oct.', titre: 'Entrer dans AIME', texte: 'Connexion avec Google, clé d’accès et lien par e-mail fiable : les mêmes comptes qu’AIMESTUDIO.', source: 'PR #2' },
        { quand: '28 oct.', titre: 'Le Réseau, les profils et AIME Wedding', texte: 'Un annuaire par domaine, une page pour chaque profil, l’accueil plein cadre. L’orbe devient « le Point » et guide la visite.', source: 'PR #3' },
        { quand: '28 oct.', titre: 'Le vrai atelier de broderie, dans le site', texte: 'Point Zéro migre sous /studio/ ; les ouvrages se rangent dans Votre espace AIME.', source: 'PR #4' },
        { quand: '28 oct.', titre: 'Les docks, la Boutique et la Métamorphose', texte: 'Les verbes en haut, les lieux en bas. Mon confort tient sur une ligne du dock ; la Boutique et la Métamorphose arrivent.', puces: ['Docks', 'Boutique', 'Métamorphose', 'Mon confort', 'Pictos des outils'], source: 'PR #5 à #9' },
        { quand: '28 oct.', titre: 'Les cartes qui se retournent', texte: 'Fiche enrichie, dates libres ou en option, demandes, et au dos de chaque carte l’orbe assistant.', source: 'PR #10 et #11' },
        { quand: '28 oct.', titre: 'La journée en musique', texte: 'Ma musique, Play au dos des cartes, une page Musique en timeline du Jour J, et l’envoi de ses propres morceaux (MP3, M4A, WAV, OGG ; 20 Mo).', source: 'PR #12 et #13' },
        { quand: '28 oct.', titre: 'Sécurité', texte: 'Suppression de compte complète, StudiO cloisonné par compte, analyse réservée aux comptes.', source: 'PR #19' },
        { quand: '29 oct.', titre: 'La Charte AIME devient un design system', texte: 'Jetons, charte en français, dix composants, les orbes et la photographie. L’Atlas de pique de cœur en est la première application.' }
      ],
      visuels: [
        { src: 'media/fils.jpg', alt: 'L’atelier Point Zéro : une initiale A brodée de roses, avec la palette des fils DMC dans le dock du bas', accroche: 'Le StudiO', legende: 'L’atelier dans le site' },
        { src: 'media/grille-roses.jpg', alt: 'Un bouquet de roses brodé sur une toile écrue', accroche: 'Point Zéro · l’étape 0', legende: 'On part du centre' }
      ]
    }
  ],
  demain: {
    id: 'demain', lieu: 'Demain', date: 'Après le 29 octobre 2026', titre: 'Demain',
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
