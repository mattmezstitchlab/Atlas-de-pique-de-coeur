# DockBas

Le dock sombre du bas : une orbe de progression de lecture, puis les lieux de la page en mots cerclés de blanc.

Rendu statique du CSS du site (`components/bundle.css`), écrit à la main d’après `src/styles.css` et `src/charte/` de LEMONDEAIME.

## Quand l’utiliser
Fixé à 18px du bas sur les pages longues. Il liste les **lieux** de la page (les sections) ; le courant est une pilule blanche. L’orbe montre la progression de lecture (un arc par lieu) et change de mode (Navigation, Musique, modes de la page).

## Ce que vous fournissez
La liste des lieux `[id, libellé]`, correspondant aux id des sections ; des modes en plus si besoin.

## Mesures
Conteneur : marge 7px, rayon `rayon-dock`, fond `dock`, 1px `dock-trait`, `ombre-dock-bas`. `.lieu` : `hauteur-lieu`, marges 0 16px, rayon 11px, 1px `dock-trait`, blanc 15/500 ; courant : fond blanc, `encre` 700, bordure blanche 2px. Le contour de focus est blanc ici.
