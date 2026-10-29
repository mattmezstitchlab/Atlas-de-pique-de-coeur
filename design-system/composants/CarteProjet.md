# CarteProjet

Une carte de projet : une photo 4:3 dans un cadre arrondi de 20px, un titre en 600 avec une petite accroche en capitales, et une courte description.

Rendu statique du CSS du site (`components/bundle.css`), écrit à la main d’après `src/styles.css` et `src/charte/` de LEMONDEAIME.

## Quand l’utiliser
Galeries de studios, projets et collections (grille `.cartes`, ou `.cartes.ligne` pour une rangée qui défile à l’horizontale, avec aimantation).

## Ce que vous fournissez
Une photo (4:3, vraie scène) avec son `alt`, un titre, une accroche en option (`small`, capitales), une description d’une ou deux lignes (46ch max). Ajoutez une étiquette `.bientot` pour ce qui n’est pas encore en ligne.

## Mesures
Rayon du cadre `rayon-carte`, fond `cadre`. Survol : la photo grossit à 1,04 en .8s. Titre `titre-carte`, accroche 13/600 `0.1em` `encre-3`, description `corps` `encre-2`. Écart de grille 56 × `espace-6`.
