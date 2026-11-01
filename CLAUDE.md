# Atlas de pique de cœur

L’atlas de l’écosystème AIME : l’histoire de tous les projets, du début à demain. Tout ce qui est produit ici (une page, une section, une fiche, un visuel, une réponse mise en forme) suit **le design system AIME**, rangé dans `design-system/`.

## Avant toute demande

1. Lire `design-system/README.md` (la charte : voix, couleurs, typographie, espacements, l’orbe, l’accessibilité).
2. Pour un composant, lire sa fiche dans `design-system/composants/` et utiliser ses classes telles quelles.
3. Les valeurs viennent de `design-system/tokens.json`, compilées dans `css/tokens.css`. Ne jamais écrire une couleur, un rayon ou un espacement en dur quand un jeton existe : `var(--encre)`, `var(--rayon-champ)`, `var(--espace-5)`.

## Les règles qui font la différence

- **Studio intégré, sur demande de Matthieu (novembre 2026)** : `/broderie` reprend le moteur 5D et le format Point Zéro dans ATLAS, sans lien sortant vers un autre atelier. Sources et licences dans `outils/broderie/`, bundle statique `js/broderie.js` ; voir `docs/BRODERIE.md`.
- **Rien hors de l’atlas** : pas de lien vers le studio de broderie ni la boutique ; pas de Disque reconstruit ici. Une seule sortie : le lien « Retour à Le Monde AIME » (pied de page, vers www.lemondeaime.com, dont ATLAS est un projet) ; et, dans le récit de l’accueil, le cercle .0NE (www.lemondeaime.com/studio/one/univers). Le bouton ATLAS du dock du haut ramène à l’accueil.
- **Trois espaces, des adresses définitives** : `/` (Accueil · Comprendre), `/chronologie` (Explorer), `/composition` (Créer). Une création publiée : `/composition/<id>`, en lecture seule. Aussi : `/importer` (l’import : les fichiers dans le Cube), `/vue-cube` (la vue Cube, en verre), `/ecosysteme`, `/moteur`, `/administration` (éditeur local, sans connexion : jamais présenté comme un espace sécurisé). Les anciennes adresses (`/metamorphose`, `/admin`, `/cube`, `/#chapitre`) redirigent.
- **Un seul site, lemondeaime.com** : ATLAS est servi sous `www.lemondeaime.com/atlas/` (une réécriture dans la configuration Vercel de LEMONDEAIME vers `atlas.lemondeaime.com`), et aussi à la racine de `atlas.lemondeaime.com`. Donc : **jamais de chemin absolu** (`/css/…`, `/chronologie`) dans une page ou un script, toujours relatif (`css/…`, `chronologie.html`) ; **jamais de redirection Vercel** (elle renverrait hors d’ATLAS) : `vercel.json` n’a que des réécritures, et une ancienne adresse est une petite page de renvoi relative (`metamorphose.html`, `admin.html`, `cube.html`). Une page qui répond à plusieurs profondeurs (`404.html`, `creation.html`) pose sa base (`/` ou `/atlas/`) puis écrit ses ressources. `tests/lemondeaime.mjs` simule lemondeaime.com, et les tests vérifient chaque page sous `/atlas/`.
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
| `index.html` | L’accueil, une seule page : le Récit du Cube (`js/recit.js`). Le Cube reste au centre de l’écran et le récit défile par-dessus, dans l’ordre du temps : Archives (Saint-Luc), Chronologie 1999 – 2025, chaque époque de 2025 – 2026 et Demain, Composition, Relations, Modules, Écosystème. À chaque station, le Cube tourne vers sa face et remplit ses cases mosaïques avec les fragments de la station ; la carte de la station dit la même chose en texte. Derrière, la projection (grand visuel, grand titre blanc). Au début, « MATT MEZ » derrière le Cube, grossi par le verre (la loupe). À la fin, le Cube se déplie en croix et devient la grille des blocs (`data/achevement.js`). Le dock du bas porte les lieux du récit |
| `chronologie.html` | La Chronologie : le hero, 1999 – 2025, les époques 2025 – 2026, la conclusion |
| `composition.html` | La Composition (Métamorphose) : l’arbre, la grille, les modules, les relations, les fusions, les recettes |
| `cube.html` | Renvoi vers `/vue-cube` : la maquette du Cube de Saint-Luc a rejoint le Cube d’ATLAS (un seul Cube : le récit de l’accueil, et la vue Cube pour l’explorer) |
| `vue-cube.html` · `js/vue-cube.js` · `css/vue-cube.css` | La vue Cube : le Cube en verre, ses six faces remplies des vrais fragments (une grille n × n par face), l’orbe au centre et les trois axes des faces opposées (Temps : Chronologie ↔ Archives ; Structure : Composition ↔ Relations ; Usage : Modules ↔ Écosystème). Choisir une case : l’orbe la relie, par des fils, à ce qui la touche dans les données ; la toucher ramène au centre. Le panneau est aussi la vue sans 3D. Derrière le Cube, la projection : le grand visuel et le grand titre blanc de la face en regard, ses fragments qui défilent ; une case choisie est projetée depuis l’orbe (son visuel de `data/visuels.js` s’il existe, sinon sa fiche : date, preuve, texte) ; les projections précédentes restent en fantômes. Une vue spéciale, pas l’accueil ; ce n’est pas le Disque. C’est le même Cube que le récit : chaque station de l’accueil s’y ouvre à sa face (`vue-cube.html#chronologie`, `#composition`, `#archives`, `#relations`, `#modules`, `#ecosysteme`) |
| `importer.html` · `js/importer.js` · `css/importer.css` · `js/vendor/pdfjs/` | L’import, « la métamorphose de l’impossible » : on dépose n’importe quels fichiers et on dit ce qu’on veut ; ATLAS les lit dans le navigateur (pdf.js 6.4.299, la version de l’atelier Point Zéro), déplie les archives ZIP (deux niveaux au plus, sans bibliothèque ; traces macOS comptées et non importées ; chiffrées, trop grosses ou anormalement compressées refusées et dites), accepte un dossier entier, reconnaît les doublons exacts (SHA-256), lit la broderie machine (Tajima `.dst`, Brother `.pes`, comme pyembroidery, MIT : le tracé dessiné point par point, les fils PEC nommés, et l’écart dit quand le fichier ne correspond pas à ce qu’il annonce), les relie **seulement** quand une raison existe (contenu dans une archive, même contenu, citation, même nom, même date, mots rares en commun ; pour le code, seuls le contenu, la citation exacte et le nom comptent ; un lien faible entre deux archives est montré sans les fondre) et les montre dans la visionneuse, le Cube (`js/vue-cube.js`, `A.vueCube.charger`) : Chronologie = dates trouvées (écrites dans le texte, ou portées par le fichier dans son archive, dites comme telles), Composition = documents rassemblés, Archives = vos fichiers, Relations = raisons, Modules = ce que la demande appelle, Écosystème = ce qui manque. Export : dossier web rangé (.zip écrit à la main), PDF (impression), manifeste `atlas-document` v1. Rien n’est envoyé ; une grille de symboles est montrée et rangée, la convertir relève de l’atelier Point Zéro |
| `ecosysteme.html` | Les projets de l’écosystème et leur état (`data/projets.js`) |
| `administration.html` | Administration → Chronologie : l’éditeur **local** (aucune connexion n’existe encore ; voir `docs/ADMINISTRATION.md`) |
| `metamorphose.html` · `admin.html` | Renvois vers les nouvelles adresses, pour les anciens liens hors Vercel |
| `moteur.html` | Le moteur : reconstruit une demande à partir des mots de la personne, et les statistiques qui le fondent |
| `css/police.css` · `fonts/inter-tight/` | La police, servie par le site (Inter Tight variable, latin et latin étendu, licence OFL dans `fonts/inter-tight/OFL.txt`) : aucune page n’appelle Google |
| `tests/` · `.github/workflows/tests.yml` | Les tests : `node --test tests/*.test.mjs`, et `tests/e2e_pages.mjs` qui ouvre chaque page comme un visiteur (sans erreur, sans défilement horizontal, police locale, aperçu de partage) puis le récit et l’import ; lancés à chaque PR. En local : `node tests/serveur.mjs 8090 &` puis `BASE=http://localhost:8090 node tests/e2e_pages.mjs` ; sous lemondeaime.com : `ATLAS=http://localhost:8090 node tests/lemondeaime.mjs 8092 &` puis `BASE=http://localhost:8092 PREFIXE=/atlas node tests/e2e_pages.mjs` |
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
| `data/temps.json` · `outils/temps.mjs` | Le temps d’ATLAS pour le calendrier du Disque de lemondeaime.com (format `atlas-temps` v1) : les entrées publiées de la chronologie et les jours de création des applications, chacun avec sa précision et sa source. Généré, jamais écrit à la main ; lisible depuis lemondeaime.com |
| `data/statistiques.js` | Ce que les gens demandent aux agents IA et ce qu’ils veulent en faire, avec leurs sources |
| `js/atlas.js` | L’affichage des données et le dock du bas |
| `js/briques.js` | La forme d’un bloc dans la Charte (fragment ou brique), partagée par l’atlas et la Métamorphose |
| `js/metamorphose.js` | L’arbre, la grille magnétique, le glisser-déposer (souris, doigt, clavier), le bloc choisi (coins, actions, réglages d’image, fiche), les liens arc-en-ciel et la fusion, les mises en page |
| `data/modules.js` | Les modules vivants (Timeline, Agenda, Facture, Intermittent, Documents, Invités, Musique, Galerie, Missions), d’après les capacités de l’atlas Base44 et les noms répétés |
| `js/modules.js` | Les modules dans la Charte : leurs formulaires, le calendrier, ce qu’ils partagent quand ils sont reliés |
| `js/chronologie.js` | L’affichage de la chronologie : sept modèles (papier, magazine, téléviseur, archive, duo, lacune, bandeau), l’axe des relations |
| `js/admin.js` · `js/coffre.js` | L’éditeur, et le coffre local des images (IndexedDB) |
| `js/theme.js` · `css/nuit.css` | Jour, Nuit, Auto |
| `js/recit.js` · `css/recit.css` | Le Récit du Cube : les stations (construites depuis les données), le Cube en vraie 3D CSS mené par le défilement et saisissable (il revient à sa place), les mosaïques (une tuile peut couvrir plusieurs cases), la projection, la loupe (enveloppe des sommets projetés → `clip-path`), le dépliage en croix, la grille des blocs |
| `docs/ADMINISTRATION.md` | Ce qui existe, ce qui manque, et la proposition de vraie administration (serveur, authentification, LIFEBOOK) |
| `js/moteur.js` | Le moteur : `analyser(texte)` est une fonction pure, l’affichage vient après |
| `js/traducteur.js` · `data/traduction.js` | Le « + » de la Composition : `traduire(analyse)` (pure) propose des fragments et des modules à partir de la lecture du moteur ; après confirmation, `ATLAS.grille.poser()` les pose, reliés. Une composition structurée, rien n’est exécuté (`docs/TRADUCTEUR.md`) |
| `js/publication.js` · `js/publier.js` · `creation.html` · `js/creation.js` · `creations/` | La publication volontaire : la section « Publier » de la Composition prépare un fichier `atlas-creation` (seulement la forme de la grille) ; ajouté dans `creations/`, il se lit en lecture seule à `/composition/<id>` (`docs/PUBLICATION.md`) |
| `media/` | La photographie de la marque |
| `design-system/` | La charte, les jetons, les fiches des composants, l’orbe et les orbes de Mon confort |

## Mettre l’atlas à jour

- **La chronologie 1999 – 2025** : par l’éditeur (`administration.html`), puis « Publier », et le fichier exporté remplace `data/chronologie.js`. Une date non documentée reste « à vérifier » ; une relation porte toujours sa justification ; une archive privée ne sort jamais de l’éditeur.
- **Un nouveau moment** : une entrée dans le chapitre voulu de `data/histoire.js`, avec sa source.
- **Un nouveau chapitre** : un objet de plus dans `chapitres` ; il apparaît aussi dans le dock du bas de la chronologie, et comme une station du Récit sur l’accueil.
- **Un nouveau projet ou un changement d’état** : `data/projets.js`.
- **Une nouvelle application Base44** : une ligne de plus dans `data/applications.js`, avec sa date de création et sa famille.
- **Après une chronologie publiée ou une nouvelle application** : `node outils/temps.mjs` régénère `data/temps.json` (le calendrier du Disque de lemondeaime.com le lit) ; `tests/temps.test.mjs` échoue tant qu’il n’est pas à jour.
- **Un nouveau visuel** : la photo dans `media/`, une ligne dans `data/visuels.js` avec un `alt` qui dit qui et où ; pour le mettre en bandeau d’une époque, son `id` dans le champ `bandeau` du chapitre (`data/histoire.js`).
- **Un module** : une entrée dans `data/modules.js` (avec ses capacités sources) et sa fonction dans `CORPS` de `js/modules.js`.
- **Une brique de l’achèvement** : `data/achevement.js` ; sa place (x, y, w, h) est en colonnes sur 12.
- **Publier une composition** : le fichier préparé dans « Publier » est ajouté sans modification dans `creations/` ; jamais de publication automatique (`docs/PUBLICATION.md`).
- **Un mot que le traducteur ne relie à aucun fragment** : l’ajouter dans `data/traduction.js`, sans accents, sous le module ou la brique voulus.
- **Un mot que le moteur ne reconnaît pas** : l’ajouter dans `data/lexique.js`, sans accents, dans la bonne liste.
- **Un nouveau chiffre** : `data/statistiques.js`, avec sa source ; quand les comptes rendus divergent, garder l’écart (min et max).
- **Une nouvelle page** : partir de `chronologie.html`, l’ajouter aux réécritures de `vercel.json` (`/ma-page` → `/ma-page.html`), garder `css/police.css` puis les trois feuilles de style dans cet ordre, les balises d’aperçu de partage (`og:`), le dock du haut et le pied de page ; l’ajouter à `PAGES` dans `tests/e2e_pages.mjs`.

Le site est statique, sans étape de construction : on ouvre `index.html` (l’accueil), ou on le sert tel quel (Vercel, GitHub Pages).
