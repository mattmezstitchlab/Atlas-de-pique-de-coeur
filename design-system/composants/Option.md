# Option

Des boutons à bascule pour choisir une valeur : contour gris au repos, remplis d’encre quand ils sont pressés.

Rendu statique du CSS du site (`components/bundle.css`), écrit à la main d’après `src/styles.css` et `src/charte/` de LEMONDEAIME.

## Quand l’utiliser
- `.opt` : un petit ensemble de choix exclusifs (texte 100 / 115 / 130 %, Normal / Aéré). Avec `aria-pressed`.
- `.carrousel-points button` : des pilules qui choisissent une diapositive ; la courante en encre (`aria-current`).
- `.ecran-bascule` : une bascule segmentée sur un rail gris ; le segment choisi est blanc avec `ombre-bascule`.

## Ce que vous fournissez
Des libellés courts (un ou deux mots), `aria-pressed` / `aria-current` pour l’état, un nom de groupe.

## Mesures
`.opt` : 64 × `hauteur-option` minimum, rayon `rayon-sm`, bordure 1px `trait-2` ; pressé : bordure 2px `encre`, fond `encre`, texte blanc 700. Désactivé : opacité .35.
