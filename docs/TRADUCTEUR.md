# Le traducteur : du « + » à la grille

Une seule transformation, de bout en bout, sans nouveau moteur :

1. **Recevoir** : une demande libre, saisie dans la section « Le + » de `/composition`.
2. **Comprendre** : `ATLAS.moteur.analyser(texte)` (`js/moteur.js`, inchangé) découpe la demande, reconnaît les intentions, garde ce qui est dit (qui, quand, où, combien, conditions, forme, ton) et liste ce qui manque.
3. **Traduire** : `ATLAS.traducteur.traduire(analyse)` (`js/traducteur.js`, fonction pure) propose pour chaque demande des modules et des briques, d’après la table `data/traduction.js`. Un même fragment proposé deux fois ne l’est qu’une fois.
4. **Confirmer** : la personne coche ce qu’elle garde. Rien n’est posé avant.
5. **Composer** : `ATLAS.grille.poser(lot)` (ajout dans `js/metamorphose.js`) pose les blocs sous la composition existante, les relie dans l’ordre des demandes, et garde sur chaque bloc la demande qui l’a fait naître (`bloc.demandes`). Un bloc dont il manque des informations porte « À compléter » jusqu’à ce que la personne le marque complété.
6. **Garder** : la composition est enregistrée comme toute composition (`localStorage`), et peut devenir une recette (`atlas-recette` v1), exportée en JSON.

## Les limites, dites franchement

- **Rien n’est exécuté.** Le résultat est une composition structurée : aucune invitation n’est envoyée, aucun devis n’est calculé, aucun rendez-vous n’est pris.
- **Une table de mots, pas une intelligence.** Un mot absent de `data/traduction.js` ne propose rien ; la page le dit. On la complète comme `data/lexique.js`.
- **Les informations reconnues ne remplissent pas les formulaires des modules.** Elles sont gardées dans la fiche du bloc ; les reporter dans un module reste un geste de la personne.
- **Tout reste sur l’appareil.** Rien n’est envoyé ; aucune composition n’a encore d’adresse publique.

## Vers .0NE : ce qui manque pour « retrouver depuis .0NE » (proposition, non construite)

.0NE pourrait ouvrir une création publique d’ATLAS par son adresse, sans recopier les moteurs ni partager de données personnelles :

- une composition **publiée volontairement** devient un fichier public `atlas-recette` v1 servi à une adresse stable (par exemple `/composition?recette=<id>`), en lecture seule ;
- elle ne contient que les blocs (type, référence, place), les liens et les phrases reconstruites ; **jamais** les données saisies dans les modules (invités, montants, documents, photos) ni les archives privées ;
- .0NE ne lit que cette adresse ; ATLAS n’embarque pas le Disque et .0NE ne réécrit rien dans ATLAS.

La publication suppose un stockage côté serveur et une décision explicite de la personne : rien de cela n’existe encore (voir `docs/ADMINISTRATION.md`).
