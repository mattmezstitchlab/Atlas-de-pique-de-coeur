# Atlas de pique de cœur

À la recherche du temps créé : de 1999 et des ateliers de Saint-Luc aux 643 applications de l’écosystème AIME, construit avec le design system AIME.

- **Voir** : ouvrir `index.html`, ou le servir tel quel (aucune installation, aucune construction).
- **Le moteur** : `moteur.html` reconstruit une demande à partir des mots de la personne, dans l’ordre, et la fonde sur ce que les gens demandent aux agents IA.
- **La Métamorphose** : `metamorphose.html` range les 643 applications en arbre par famille ; on les glisse sur une grille magnétique où elles prennent la forme de la Charte, ou on compose l’achèvement d’un geste. Un bloc touché s’agrandit par ses coins, change de style ou de visuel, et sa fiche dit ce qu’il raconte ; six mises en page recomposent la grille d’un clic.
- **Les modules** : Timeline (couches, plan B, dépendances), Agenda, Facture (devis, impression en PDF), Intermittent, Documents, Invités, Musique, Galerie, Missions — les fonctionnalités recréées le plus souvent, en blocs vivants. Reliés, une lumière arc-en-ciel passe de l’un à l’autre et leurs données avec elle ; fusionnés, ils ne font qu’un bloc. Une composition se garde comme recette, s’exporte et se réimporte.
- **Mettre à jour** : les données sont dans `data/histoire.js`, `data/projets.js` et `data/visuels.js`.
- **La chronologie et son administration** : `admin.html` édite la chronologie 1999 – 2025 (événements, archives privées ou publiées, relations justifiées, versions, journal, références LIFEBOOK). C’est un éditeur **local** : il n’existe pas encore de connexion propriétaire ni de base ; tout est expliqué dans `docs/ADMINISTRATION.md`.
- **Jour et Nuit** : le choix est dans le dock du haut, gardé sur l’appareil.
- **Le design system** : `design-system/README.md` pour la charte, `design-system/tokens.json` pour les jetons, `design-system/composants/` pour les composants.
- **Travailler avec Claude** : `CLAUDE.md` décrit les règles que chaque demande suit dans ce dépôt.

## Mise en ligne sur Vercel

Le site est statique : aucune commande de construction. `vercel.json` donne des adresses propres (`/moteur` au lieu de `/moteur.html`), des en-têtes de sécurité et un cache d’un jour pour les photos ; `404.html` est la page d’erreur.

Réglages du projet Vercel : préréglage **Other**, aucune commande de construction ni d’installation, dossier de sortie **la racine du dépôt**. Chaque push sur `main` met le site en production ; chaque pull request reçoit son adresse d’aperçu.

AIME® est la marque mère. LE MONDE AIME est une association.
