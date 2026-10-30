# DockHaut

Le dock blanc du haut : flèche retour, orbe, AIME®, les verbes du site en mots, puis la recherche et le profil, flottant en haut au centre.

Rendu statique du CSS du site (`components/bundle.css`), écrit à la main d’après `src/styles.css` et `src/charte/` de LEMONDEAIME.

## Quand l’utiliser
Sur chaque page de lemondeaime.com, une fois. Il porte les **verbes** du site (Unions, Prestataires, Studio, Boutique). L’orbe, la loupe et l’avatar ouvrent chacun le même bloc vers le bas, avec un mini-dock sombre à son pied.

## Ce que vous fournissez
Les verbes (des mots, pas des pictos), le courant (`aria-current="page"`, graisse 700), et l’affichage ou non de la flèche retour (toutes les pages sauf l’accueil).

## Mesures
`.dock-haut` : marge 7px, rayon `rayon-lg` (22 ouvert), fond `carte`, 1px `trait`, `ombre-dock` (`ombre-dock-ouvert` ouvert, 860px max). Outils `.outil` : `hauteur-outil`, rayon `rayon-champ`, texte `outil` ; survol `doux`. Séparateurs 1 × 30px `trait`. Échap ferme et rend le focus.
