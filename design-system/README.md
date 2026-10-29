# AIME

AIME® est la marque mère de LE MONDE AIME (lemondeaime.com) : le site officiel de l’union, une page pour chaque personne qui la fait vivre (les mariés, les prestataires, les invités), et le StudiO pour créer. Ce système, c’est **la Charte AIME** telle que le code l’écrit : l’encre sur un papier chaud, un seul caractère, une orbe nacrée. Comme le dit le code : *deux docks, en haut les verbes (blanc), en bas les lieux (sombre). Des mots plutôt que des pictos ; titres en 600, le 900 réservé à la signature de chaque page d’accueil.*

## La voix

- **En français, chaleureux, simple.** L’interface vouvoie, en phrases entières : « Entrez dans AIME, sans quitter la page : vos projets, vos ouvrages et votre profil vous suivent sur tous vos appareils. »
- **Dire ce qui se passe.** Les notes expliquent les conséquences, pas les fonctions : « Réglé une fois, appliqué partout, gardé sur cet appareil. »
- **Des verbes et des lieux.** Le dock du haut porte les verbes du site (Unions, Prestataires, Studio, Boutique) ; le dock du bas, les lieux de la page. On nomme les choses avec des mots, pas des pictos.
- **Le nom.** **AIME®** dans le logotype (® en exposant à .38em, graisse 400), **AIME** dans le texte courant, **LE MONDE AIME** en capitales. Les produits gardent leur graphie : Point Zéro, BurO, StudiO, A+.
- Typographie française : espace avant `:` `;` `?` `!`, apostrophes typographiques (’) et « guillemets ».

## Les fondations visuelles

**La couleur, c’est l’encre.** L’interface est monochrome : `encre` sur `fond`, les surfaces surélevées en `carte`, les contours en `trait`. La couleur vient de la photographie et de la **nacre**, le dégradé perlé de l’orbe (`nacre-blanc` → `nacre-ciel` → `nacre-lilas` → `nacre-rose` → `nacre-menthe`). Les teintes nacrées ne servent ni au texte ni aux boutons : elles sont pour l’orbe, les dossiers et les surlignages doux.

- Texte : `encre` pour tout ce qui compte, `encre-2` pour le texte courant et les chapeaux, `encre-3` pour les surtitres et les métadonnées. Rien de plus clair que `encre-3` sur fond clair.
- Lieux sombres : `dock` pour le dock du bas, `sombre` pour la bande noire et le dos des cartes ; le texte y est en `blanc` / `blanc-2` / `blanc-3`.
- Les états sont rares et fonctionnels : `libre` (un point vert, seulement sur fond sombre), `option-fond` + `option-trait` (en option), `prise` (pris, barré), `erreur` pour les messages d’erreur.
- Deux paires de la source sont sous le seuil WCAG : `trait-champ` en bordure de champ (1,9:1) et les jours `prise` (3,1:1). Elles sont gardées telles quelles ; l’étiquette et le barré portent le sens.

**Un seul caractère.** Inter Tight (Google Fonts, 400 à 900), approche serrée aux grandes tailles (`-0.035em` à `-0.045em`), capitales seulement pour `signature`, `grand-mot` et `surtitre` (approche `0.14em`). Les titres sont en **600**. Le **900** apparaît une fois par page d’accueil, pour sa signature. Les grandes tailles sont fluides (`clamp()`) ; les jetons donnent le maximum.

**De l’air.** Les sections sont séparées par un filet `trait` et `espace-section` (140px) ; la marge de page `marge` va de 16 à 56px. Les grilles sont en `auto-fit` avec des gouttières `espace-5` × `espace-7`.

**Arrondi, jamais rond.** Les contrôles utilisent `rayon-champ` (12) et `rayon-bouton` (13) ; les docks `rayon-dock` / `rayon-lg` ; les photos de `rayon-md` à `rayon-xl`. Les pilules (`rayon-pilule`) sont pour les puces, les dates et le carrousel.

**Des filets d’abord, des ombres ensuite.** Les surfaces se séparent par des lignes `trait`. Seul ce qui flotte porte une ombre (`ombre-dock`, `ombre-menu`, `ombre-dock-bas`) : longue, douce, teintée d’encre.

**Un mouvement calme.** Les photos zooment de 4 % en .8s au survol (`cubic-bezier(.2,.7,.2,1)`), la carte se retourne en .6s sur la même courbe. *Mon confort → Mouvement réduit* et `prefers-reduced-motion` coupent tout.

**La photographie porte l’émotion.** Plein cadre, cinématographique, de vrais lieux (un phare à marée haute, un motel du désert la nuit). Le texte sur photo est blanc, sur un dégradé en bas (`rgba(0,0,0,.6)` → transparent), avec un `surtitre` d’accroche et une ligne `legende`.

## L’orbe

L’orbe est le signe à côté du logotype, et la commande de **Mon confort**. Au repos, c’est le disque nacré (`assets/Logos/aime-orbe.svg`). Dans les docks, elle devient des arcs autour d’un iris nacré ; chaque profil de confort a son nombre d’arcs et ses couleurs (`assets/Orbes/`) : Nacre (réglages de l’appareil), Lecture (115 %, aéré), Grand texte (130 %), Calme (rien ne bouge), Contraste, Écoute (sons et vibrations).

## L’accessibilité fait partie de la marque

- Le focus est toujours visible : `outline: 2px solid encre; outline-offset: 3px` (blanc sur fond sombre).
- Les cibles font au moins `hauteur-min` (40px) ; les champs et boutons principaux `hauteur-champ` (52px).
- **Mon confort** s’applique à tout le site par des classes sur `<html>` : `.aere` (lettres 0.05em, mots 0.14em, interligne 1.75), `.contraste` (contraste 1,35, soulignés plus épais), `.calme` (aucune transition).
- Tout contrôle sans texte porte un `aria-label` ; les changements sont annoncés dans une zone `aria-live="polite"`.

## Utiliser le système

1. Chargez Inter Tight depuis Google Fonts.
2. Chargez `tokens.css` (toutes les variables : couleurs, espacements, rayons, ombres, hauteurs, `--font-sans`, et une classe par style de texte : `.titre`, `.chapeau`, `.surtitre`…).
3. Chargez ensuite `components/bundle.css` : les composants sont les classes CSS du site, à poser sur du HTML ou du React (`.bouton.noir`, `.champ`, `.outil`, `.lieu`, `.opt`…).
4. Utilisez les jetons par leurs variables : `var(--encre)`, `var(--rayon-champ)`, `var(--espace-5)`.

Les aperçus des composants sont des rendus statiques.

## Ce qui n’a pas été repris

Construit à partir de **mattmezstitchlab/LEMONDEAIME** au commit `f2d2b35` (`src/styles.css`, `src/charte/`, `src/lib/confort.ts`, `public/media/`).

- **Composants :** lecture seule. Les composants React (`Tete`, `DockBas`, `Visuel`…) n’ont pas été compilés ; chaque fiche est un rendu statique avec les classes du site. Sans fiche : la visite guidée (`.visite-*`), le panneau Métamorphose, les listes de musique, l’écran du studio (`.ecran`), la carte qui se retourne (`.carte-flip`, `.dos-*`).
- **Polices :** Inter Tight vient de Google Fonts ; aucun fichier de police dans le dépôt.
- **Logo :** pas de fichier logo ; la marque est typographique (AIME® en Inter Tight 800) avec l’orbe, dessinée en SVG à partir du dégradé et de la géométrie des arcs du code.
- **Hors jetons :** `--nacre` (un dégradé) et `--marge` (un `clamp()`) sont dans `bundle.css` ; les tailles fluides en `clamp()` sont données à leur maximum.
- **Le studio** (`studio/`, son `index.css` et `design/`) et l’application Base44 **Aime-wedding** (un thème shadcn sombre en Inter et Cormorant Garamond) ont leur propre allure et ne font pas partie de ce système.
