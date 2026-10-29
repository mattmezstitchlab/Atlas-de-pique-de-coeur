# Calendrier

Un mois de jours en boutons de 48px qui montre les dates libres, en option et prises, avec une légende.

Rendu statique du CSS du site (`components/bundle.css`), écrit à la main d’après `src/styles.css` et `src/charte/` de LEMONDEAIME.

## Quand l’utiliser
Disponibilités d’un prestataire (Mon profil, fiche du Réseau). Un clic fait tourner l’état d’un jour pour le propriétaire ; les visiteurs le lisent.

## Ce que vous fournissez
Le mois, l’état de chaque jour et la légende (toujours affichée : la couleur n’est jamais le seul indice).

## Mesures
`.cal` 7 colonnes de 52px max, écart 6px. `.cal-j` : 48px, rayon `rayon-champ`, 1px #D6D6D2, 15/600. `.libre` : fond `encre`, texte blanc, soulignement intérieur 4px `libre`. `.option` : `option-fond`, bordure `option-trait`. `.prise` : `papier`, texte `prise`, barré. Jours de la semaine 13/600 `encre-3`.
