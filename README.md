# Atlas de pique de cœur

L’histoire de tous les projets de l’écosystème AIME, du premier prototype de mai 2026 à la feuille de route, construite avec le design system AIME.

- **Voir** : ouvrir `index.html`, ou le servir tel quel (aucune installation, aucune construction).
- **Le moteur** : `moteur.html` reconstruit une demande à partir des mots de la personne, dans l’ordre, et la fonde sur ce que les gens demandent aux agents IA.
- **Mettre à jour** : les données sont dans `data/histoire.js` et `data/projets.js`.
- **Le design system** : `design-system/README.md` pour la charte, `design-system/tokens.json` pour les jetons, `design-system/composants/` pour les composants.
- **Travailler avec Claude** : `CLAUDE.md` décrit les règles que chaque demande suit dans ce dépôt.

## Mise en ligne sur Vercel

Le site est statique : aucune commande de construction. `vercel.json` donne des adresses propres (`/moteur` au lieu de `/moteur.html`), des en-têtes de sécurité et un cache d’un jour pour les photos ; `404.html` est la page d’erreur.

Réglages du projet Vercel : préréglage **Other**, aucune commande de construction ni d’installation, dossier de sortie **la racine du dépôt**. Chaque push sur `main` met le site en production ; chaque pull request reçoit son adresse d’aperçu.

AIME® est la marque mère. LE MONDE AIME est une association.
