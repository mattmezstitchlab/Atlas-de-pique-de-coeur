# Pastille

Petites pastilles d’état : la disponibilité d’une date, l’état d’une fiche, et l’étiquette « Bientôt ».

Rendu statique du CSS du site (`components/bundle.css`), écrit à la main d’après `src/styles.css` et `src/charte/` de LEMONDEAIME.

## Quand l’utiliser
- `.pastille-date` dans le coin d’une photo : `.libre` (pilule encre avec un point `libre`), `.prise` (blanc .9), blanc par défaut.
- `.pastille-fiche` en tête d’une page de prestataire : neutre sur `papier`, `.libre` encre avec point, `.option` sur `option-fond`.
- `.bientot` : une étiquette de 11px après un lien ou un titre pas encore en ligne.

## Ce que vous fournissez
Les mots (« Libre le 14 juin », « En option ») ; le point ne porte jamais le sens à lui seul.

## Mesures
Rayon `rayon-pilule` (`rayon-xs` pour `.bientot`), 13 à 16px / 600 à 700.
