# Bouton

L’action principale : un rectangle arrondi de 52px avec une bordure encre de 1px ; `.noir` le remplit d’encre pour l’action principale d’un bloc.

Rendu statique du CSS du site (`components/bundle.css`), écrit à la main d’après `src/styles.css` et `src/charte/` de LEMONDEAIME.

## Quand l’utiliser
- `.bouton.noir` : l’action principale d’un bloc (Entrer, Envoyer le lien). Un seul par bloc.
- `.bouton` : toutes les autres actions à côté.
- `.bouton-meta` : la pilule avec une orbe incrustée, pour ouvrir un panneau (La Métamorphose).
- `.entrer-alt` : les autres façons d’entrer (clé d’accès, Google) ; bordure plus légère `trait-champ`, 48px.

## Ce que vous fournissez
Un `<button>` ou un `<a>` avec un verbe dans le libellé (« Entrer dans AIME », pas « OK »). En option, un picto au trait de 18 à 20px avant le libellé (écart `espace-2`).

## Mesures
Hauteur `hauteur-champ` · marges 0 22px · rayon `rayon-bouton` · texte `bouton` (16/600) · survol de `.noir` : opacité .9 · focus : contour 2px `encre`, décalage 3px.
