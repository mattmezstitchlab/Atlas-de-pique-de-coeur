# Visuel

Une grande photo, ou une vidéo muette, avec une accroche et une légende blanches sur un dégradé en bas.

Rendu statique du CSS du site (`components/bundle.css`), écrit à la main d’après `src/styles.css` et `src/charte/` de LEMONDEAIME.

## Quand l’utiliser
Pour ouvrir une section avec de l’émotion : une image pleine largeur (hauteur `clamp(22rem, 50vw, 46rem)`), ou une vidéo avec un bouton « Activer le son ».

## Ce que vous fournissez
`src`, un `alt` qui décrit, en option une `accroche` (qui) et une `legende` (où), une position si le sujet est décentré. Les vidéos démarrent sans le son, et pas du tout en mouvement réduit.

## Mesures
Rayon `rayon-md`, fond `#111`, dégradé `rgba(0,0,0,.6)` → 0 sur la moitié basse. Accroche = `surtitre` en blanc ; légende = `legende`. Bouton son : pilule de 48px, bordure 1px blanc .7.
