# Studio de broderie intégré

À la demande de Matthieu, `/broderie` est une nouvelle page d’ATLAS ; elle ne remplace ni le Cube ni la Composition. L’accueil y donne accès. Adresses relatives, à la racine et sous `/atlas/`.

## Ce qui est repris

Le moteur 5D, ses garde-fous, sa palette DMC et le format `Pattern` proviennent du studio Point Zéro intégré à LEMONDEAIME, révision `3c999af23ba863c65fae88bfb9556139dee98a6b`. Les neuf fichiers dans `outils/broderie/moteur/` sont copiés sans réécriture fonctionnelle. Licence MIT jointe ; données `craft-color-codes` MakeBead, CC BY 4.0, version 1.0.0 verrouillée. Les fichiers JSON et SVG exportés portent cette attribution.

L’interface est native, statique et conforme aux jetons d’ATLAS : cinq réglages (quatre choix chacun), graine, génération déterministe, vue broderie et patron symbolique, sélection DMC, ajout / effacement de croix, suivi case par case, comptage de toile, vingt annulations et sauvegarde locale. La grille se modifie au toucher ou par coordonnées au clavier. Le motif du visuel fourni est une direction d’interface, pas une image employée à la place du calcul.

## Conservation et exports

- Clé isolée `atlas-broderie-v1`, pas de migration ni d’accès aux ouvrages de lemondeaime.
- Sauvegarde après chaque modification, erreurs de stockage annoncées ; JSON téléchargeable indispensable pour une copie durable. Pas de compte, cloud ou garantie contre l’effacement des données du navigateur.
- JSON Point Zéro v3 avec table des références DMC : retouches et suivi conservés. Import plafonné à 5 Mo et 160 × 160 points. Points non entiers, ornements, annotations, calques et scènes sont refusés, jamais aplatis silencieusement.
- SVG : grille complète, repères de dix, symboles et légende des fils réellement utilisés.
- Impression / PDF via le dialogue du navigateur : feuilles de 40 × 40 cases avec coordonnées et légende. Aucun service distant. La taille dessinée à l’impression est celle du patron agrandi, pas celle de l’ouvrage sur toile.

## Limites assumées

Ce n’est pas la copie de toute l’application multistudio : pas de puzzle / import PDF, conversion photo, génération d’image distante, points spéciaux, bibliothèque multi-ouvrages ou boutique. Le nuancier est une sélection de références approximatives à l’écran, à confirmer sur carte physique. Le disque propose le nuancier DMC par familles et nuances paginées, avec le classement HSL de lemondeaime. La toile peut être rectangulaire (frise), sans recadrage du motif.

## Développement et vérifications

Le site garde son déploiement statique sans build Vercel : `js/broderie.js` est généré et versionné. Ne pas le modifier à la main.

```sh
npm --prefix outils/broderie ci
npm --prefix outils/broderie run build
node --test tests/*.test.mjs
node tests/serveur.mjs 8090
# dans un autre terminal, avec Playwright installé :
BASE=http://localhost:8090 node tests/e2e_pages.mjs
BASE=http://localhost:8090 node tests/e2e_broderie.mjs
```

Les tests comparent l’empreinte SHA-256 de toutes les sources et du verrou de dépendances à celle des deux bundles générés. La CI existante exécute les tests sans nouvelle installation de dépendances ; les parcours broderie sont inclus dans le test de pages. Les tests du moteur portent sur ses dimensions, déterminisme, palette, copies modifiées et refus d’import, ainsi que les exports symboliques. Les tests navigateur vérifient génération, édition, annulation, stockage, JSON et SVG. Une impression physique à 100 % reste à vérifier humainement.

## Disque de métamorphose

La couronne entoure la toile : cinq dimensions, puis quatre réponses, ou Fils DMC → fil du motif → famille → nuances. Le classement `famillesFils.ts` est repris sans modification de la même source que le moteur. Chaque référence est accessible (pagination de douze nuances).

Chaque changement produit un vrai aperçu au centre. Confirmer inscrit une seule modification dans l’historique et sauvegarde ; Annuler remet la grille, la recette et le suivi d’origine. Un changement de géométrie annonce qu’il remplacera les retouches et le suivi. Un remplacement DMC conserve les cases occupées et le suivi ; les essais successifs repartent toujours de la grille avant aperçu. Exports, dessin et sauvegarde sont bloqués pendant l’aperçu pour ne pas confondre essai et ouvrage confirmé. Quitter la page avec un aperçu en attente déclenche la protection standard du navigateur.

Les commandes du disque sont des boutons nommés, accessibles par Tabulation / Entrée ; flèches gauche/droite, Début/Fin et Échap sont pris en charge. Les curseurs classiques restent sous le disque. Animation discrète, supprimée avec mouvement réduit. Le patron demeure rectangulaire et entièrement visible au centre, même pour les frises.
