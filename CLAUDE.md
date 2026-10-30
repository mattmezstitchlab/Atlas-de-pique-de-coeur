# Atlas de pique de cœur

L’atlas de l’écosystème AIME : l’histoire de tous les projets, du début à demain. Tout ce qui est produit ici (une page, une section, une fiche, un visuel, une réponse mise en forme) suit **le design system AIME**, rangé dans `design-system/`.

## Avant toute demande

1. Lire `design-system/README.md` (la charte : voix, couleurs, typographie, espacements, l’orbe, l’accessibilité).
2. Pour un composant, lire sa fiche dans `design-system/composants/` et utiliser ses classes telles quelles.
3. Les valeurs viennent de `design-system/tokens.json`, compilées dans `css/tokens.css`. Ne jamais écrire une couleur, un rayon ou un espacement en dur quand un jeton existe : `var(--encre)`, `var(--rayon-champ)`, `var(--espace-5)`.

## Les règles qui font la différence

- **En français**, vouvoiement, phrases entières, typographie française (espace insécable avant `:` `;` `?` `!`, apostrophe ’, « guillemets »).
- **L’encre sur le papier** : `encre` sur `fond`, surfaces en `carte`, filets en `trait`. La couleur vient des photos et de la nacre de l’orbe, jamais des boutons.
- **Un seul caractère**, Inter Tight. Titres en 600. Le 900 une seule fois par page, pour sa signature.
- **Deux docks** : en haut les verbes (blanc), en bas les lieux de la page (sombre). Des mots, pas des pictos.
- **De l’air** : `espace-section` entre les sections, séparées par un filet `trait`.
- **Accessibilité** : focus visible, cibles de 40px minimum, `alt` qui dit qui et où, `prefers-reduced-motion` respecté.
- **Ne rien inventer** : chaque date, chiffre ou état vient d’une source (historique git, fichier de données). Ce qui est proposé et pas engagé est dit comme tel.

## Où sont les choses

| Chemin | Ce que c’est |
| --- | --- |
| `index.html` | La page de l’atlas : la structure et les docks |
| `metamorphose.html` | La Métamorphose : les 643 projets en fragments à glisser sur une grille magnétique, et l’achèvement |
| `moteur.html` | Le moteur : reconstruit une demande à partir des mots de la personne, et les statistiques qui le fondent |
| `css/tokens.css` | Les jetons compilés (générés depuis `design-system/tokens.json`) |
| `css/composants.css` | Les composants du site lemondeaime.com (boutons, champs, docks, cartes, pastilles…) |
| `css/atlas.css` | La mise en page propre à l’atlas |
| `data/histoire.js` | Les chapitres, moments, visuels et la feuille de route |
| `data/applications.js` | Les 643 applications Base44 (date de création, nom, famille) et les familles |
| `data/achevement.js` | Les briques de l’achèvement et leur composition sur la grille |
| `data/projets.js` | Les projets de l’écosystème et leur état |
| `data/lexique.js` | Les mots que le moteur reconnaît (intentions, moments, lieux, conditions, ordre) |
| `data/visuels.js` | La bibliothèque des visuels (photo, texte alt, famille) : les bandeaux de la chronologie et les blocs « visuel » de la Métamorphose |
| `data/statistiques.js` | Ce que les gens demandent aux agents IA et ce qu’ils veulent en faire, avec leurs sources |
| `js/atlas.js` | L’affichage des données et le dock du bas |
| `js/briques.js` | La forme d’un bloc dans la Charte (fragment ou brique), partagée par l’atlas et la Métamorphose |
| `js/metamorphose.js` | L’arbre, la grille magnétique, le glisser-déposer (souris, doigt, clavier), le bloc choisi (coins, actions, fiche), les mises en page |
| `js/disque.js` | Le Disque (repris de .ONE) : un Point au centre, une couronne de mots ; choisir un mot ouvre son niveau |
| `js/moteur.js` | Le moteur : `analyser(texte)` est une fonction pure, l’affichage vient après |
| `media/` | La photographie de la marque |
| `design-system/` | La charte, les jetons, les fiches des composants, l’orbe et les orbes de Mon confort |

## Mettre l’atlas à jour

- **Un nouveau moment** : une entrée dans le chapitre voulu de `data/histoire.js`, avec sa source.
- **Un nouveau chapitre** : un objet de plus dans `chapitres` ; il apparaît aussi dans le dock du bas.
- **Un nouveau projet ou un changement d’état** : `data/projets.js`.
- **Une nouvelle application Base44** : une ligne de plus dans `data/applications.js`, avec sa date de création et sa famille.
- **Un nouveau visuel** : la photo dans `media/`, une ligne dans `data/visuels.js` avec un `alt` qui dit qui et où ; pour le mettre en bandeau d’une époque, son `id` dans le champ `bandeau` du chapitre (`data/histoire.js`).
- **Une brique de l’achèvement** : `data/achevement.js` ; sa place (x, y, w, h) est en colonnes sur 12.
- **Un mot que le moteur ne reconnaît pas** : l’ajouter dans `data/lexique.js`, sans accents, dans la bonne liste.
- **Un nouveau chiffre** : `data/statistiques.js`, avec sa source ; quand les comptes rendus divergent, garder l’écart (min et max).
- **Une nouvelle page** : partir de `index.html`, garder les trois feuilles de style dans cet ordre, le dock du haut et le pied de page.

Le site est statique, sans étape de construction : on ouvre `index.html`, ou on le sert tel quel (Vercel, GitHub Pages).
