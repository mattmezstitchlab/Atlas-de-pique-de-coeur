# Atlas de pique de cœur

L’atlas de l’écosystème AIME : l’histoire de tous les projets, du début à demain. Tout ce qui est produit ici (une page, une section, une fiche, un visuel, une réponse mise en forme) suit **le design system AIME**, rangé dans `design-system/`.

## Avant toute demande

1. Lire `design-system/README.md` (la charte : voix, couleurs, typographie, espacements, l’orbe, l’accessibilité).
2. Pour un composant, lire sa fiche dans `design-system/composants/` et utiliser ses classes telles quelles.
3. Les valeurs viennent de `design-system/tokens.json`, compilées dans `css/tokens.css`. Ne jamais écrire une couleur, un rayon ou un espacement en dur quand un jeton existe : `var(--encre)`, `var(--rayon-champ)`, `var(--espace-5)`.

## Les règles qui font la différence

- **Rien hors de l’atlas** : pas de lien vers le studio de broderie ni la boutique ; pas de Disque reconstruit ici. Une seule sortie : le lien « Retour à AIME · .0NE » (pied de page, et le cercle de l’accueil). Le bouton ATLAS du dock du haut ramène à l’accueil.
- **Trois espaces, des adresses définitives** : `/` (Accueil · Comprendre), `/chronologie` (Explorer), `/composition` (Créer). Une création publiée : `/composition/<id>`, en lecture seule. Aussi : `/cube` (le Cube de Saint-Luc, maquette), `/ecosysteme`, `/moteur`, `/administration` (éditeur local, sans connexion : jamais présenté comme un espace sécurisé). Les anciennes adresses (`/metamorphose`, `/admin`, `/#chapitre`) redirigent.
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
| `index.html` | L’accueil « Voir l’invisible » : le Cube (`js/cube.js`), les trois espaces, Saint-Luc, du fragment à la composition, l’essai (vrais modules), les preuves, le carré / le cercle / le Point |
| `chronologie.html` | La Chronologie : le hero, 1999 – 2025, les époques 2025 – 2026, la conclusion |
| `composition.html` | La Composition (Métamorphose) : l’arbre, la grille, les modules, les relations, les fusions, les recettes |
| `cube.html` · `data/cube.js` · `js/cube-saint-luc.js` · `css/cube-saint-luc.css` | Le Cube de Saint-Luc (maquette) : cinq faces en grilles mosaïques, la sixième ouverte sur la chronologie intérieure, une seule mémoire de fragments (chaque fragment posé au plus une fois ; la rotation ne touche jamais aux données), le Cube à plat sans 3D. Les noms des faces sont une hypothèse (`data/cube.js`) |
| `ecosysteme.html` | Les projets de l’écosystème et leur état (`data/projets.js`) |
| `administration.html` | Administration → Chronologie : l’éditeur **local** (aucune connexion n’existe encore ; voir `docs/ADMINISTRATION.md`) |
| `metamorphose.html` · `admin.html` | Renvois vers les nouvelles adresses, pour les anciens liens hors Vercel |
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
| `data/chronologie.js` | La chronologie **publiée** 1999 – 2025 (entrées, archives, relations) : public, produit par l’éditeur |
| `data/statistiques.js` | Ce que les gens demandent aux agents IA et ce qu’ils veulent en faire, avec leurs sources |
| `js/atlas.js` | L’affichage des données et le dock du bas |
| `js/briques.js` | La forme d’un bloc dans la Charte (fragment ou brique), partagée par l’atlas et la Métamorphose |
| `js/metamorphose.js` | L’arbre, la grille magnétique, le glisser-déposer (souris, doigt, clavier), le bloc choisi (coins, actions, réglages d’image, fiche), les liens arc-en-ciel et la fusion, les mises en page |
| `data/modules.js` | Les modules vivants (Timeline, Agenda, Facture, Intermittent, Documents, Invités, Musique, Galerie, Missions), d’après les capacités de l’atlas Base44 et les noms répétés |
| `js/modules.js` | Les modules dans la Charte : leurs formulaires, le calendrier, ce qu’ils partagent quand ils sont reliés |
| `js/chronologie.js` | L’affichage de la chronologie : sept modèles (papier, magazine, téléviseur, archive, duo, lacune, bandeau), l’axe des relations |
| `js/admin.js` · `js/coffre.js` | L’éditeur, et le coffre local des images (IndexedDB) |
| `js/theme.js` · `css/nuit.css` | Jour, Nuit, Auto |
| `js/cube.js` · `js/accueil.js` · `css/accueil.css` | Le Cube (vraie 3D CSS, pointeur, toucher, clavier, liste des faces sans 3D) et l’accueil |
| `docs/ADMINISTRATION.md` | Ce qui existe, ce qui manque, et la proposition de vraie administration (serveur, authentification, LIFEBOOK) |
| `js/moteur.js` | Le moteur : `analyser(texte)` est une fonction pure, l’affichage vient après |
| `js/traducteur.js` · `data/traduction.js` | Le « + » de la Composition : `traduire(analyse)` (pure) propose des fragments et des modules à partir de la lecture du moteur ; après confirmation, `ATLAS.grille.poser()` les pose, reliés. Une composition structurée, rien n’est exécuté (`docs/TRADUCTEUR.md`) |
| `js/publication.js` · `js/publier.js` · `creation.html` · `js/creation.js` · `creations/` | La publication volontaire : la section « Publier » de la Composition prépare un fichier `atlas-creation` (seulement la forme de la grille) ; ajouté dans `creations/`, il se lit en lecture seule à `/composition/<id>` (`docs/PUBLICATION.md`) |
| `media/` | La photographie de la marque |
| `design-system/` | La charte, les jetons, les fiches des composants, l’orbe et les orbes de Mon confort |

## Mettre l’atlas à jour

- **La chronologie 1999 – 2025** : par l’éditeur (`administration.html`), puis « Publier », et le fichier exporté remplace `data/chronologie.js`. Une date non documentée reste « à vérifier » ; une relation porte toujours sa justification ; une archive privée ne sort jamais de l’éditeur.
- **Un nouveau moment** : une entrée dans le chapitre voulu de `data/histoire.js`, avec sa source.
- **Un nouveau chapitre** : un objet de plus dans `chapitres` ; il apparaît aussi dans le dock du bas.
- **Un nouveau projet ou un changement d’état** : `data/projets.js`.
- **Une nouvelle application Base44** : une ligne de plus dans `data/applications.js`, avec sa date de création et sa famille.
- **Un nouveau visuel** : la photo dans `media/`, une ligne dans `data/visuels.js` avec un `alt` qui dit qui et où ; pour le mettre en bandeau d’une époque, son `id` dans le champ `bandeau` du chapitre (`data/histoire.js`).
- **Un module** : une entrée dans `data/modules.js` (avec ses capacités sources) et sa fonction dans `CORPS` de `js/modules.js`.
- **Une brique de l’achèvement** : `data/achevement.js` ; sa place (x, y, w, h) est en colonnes sur 12.
- **Publier une composition** : le fichier préparé dans « Publier » est ajouté sans modification dans `creations/` ; jamais de publication automatique (`docs/PUBLICATION.md`).
- **Un mot que le traducteur ne relie à aucun fragment** : l’ajouter dans `data/traduction.js`, sans accents, sous le module ou la brique voulus.
- **Un mot que le moteur ne reconnaît pas** : l’ajouter dans `data/lexique.js`, sans accents, dans la bonne liste.
- **Un nouveau chiffre** : `data/statistiques.js`, avec sa source ; quand les comptes rendus divergent, garder l’écart (min et max).
- **Une nouvelle page** : partir de `chronologie.html`, garder les trois feuilles de style dans cet ordre, le dock du haut et le pied de page.

Le site est statique, sans étape de construction : on ouvre `index.html` (l’accueil), ou on le sert tel quel (Vercel, GitHub Pages).
