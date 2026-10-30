# Champ

Un champ de saisie de 52px sur blanc, à la bordure grise douce, avec son étiquette au-dessus en 600.

Rendu statique du CSS du site (`components/bundle.css`), écrit à la main d’après `src/styles.css` et `src/charte/` de LEMONDEAIME.

## Quand l’utiliser
Toute saisie sur une ligne. Associez `.champ` à un `.bouton` dans une rangée `.entrer-ligne` pour les formulaires en une étape (e-mail + Envoyer).

## Ce que vous fournissez
Une `<label>` visible (classe `etiquette-champ`, ou `.entrer-lien label` en 14px), un `placeholder` qui montre un exemple, et une ligne d’état (`.entrer-etat`, plus `.erreur` pour les erreurs en `erreur`) annoncée poliment.

## Mesures
Hauteur `hauteur-champ` (48 en `.compact`) · marges 0 14px · rayon `rayon-champ` · bordure 1px `trait-champ` · texte 17px `encre` sur `carte`. La bordure est à 1,9:1 : l’étiquette est obligatoire.
