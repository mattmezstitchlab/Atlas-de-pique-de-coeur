# Publier une composition : la plus petite publication volontaire

Une composition de la Métamorphose reste sur l’appareil (`localStorage`). Pour qu’elle puisse être retrouvée, notamment depuis .0NE, elle doit avoir une adresse publique. Cette adresse ne s’obtient que par un geste volontaire, en deux temps : la personne prépare le fichier, puis une personne l’ajoute au dépôt.

## Le parcours

1. **Une demande.** Dans `/composition`, section « Le + » : le moteur lit la demande, le traducteur propose des fragments.
2. **Des blocs.** Après confirmation, `ATLAS.grille.poser()` pose les blocs, reliés.
3. **Un choix explicite.** Dans la section « Publier » : un titre public, une description facultative, et la case « Je choisis de préparer une version publique ». Sans elle, le bouton reste inactif.
4. **Un fichier limité aux champs autorisés.** `ATLAS.publication.publier(etat, choix)` (`js/publication.js`, fonction pure) construit un fichier `atlas-creation` version 1. Il ne garde que la forme de la grille, et le fichier exact est montré avant d’être téléchargé.
5. **Un identifiant stable.** Il est formé du titre en minuscules et d’une empreinte du contenu, par exemple `demonstration-un-concert-en-deux-demandes-c010df`. La même composition sous le même titre donne toujours le même identifiant.
6. **L’ajout au dépôt.** Le fichier téléchargé est ajouté **sans modification** dans `creations/`, par un commit et une PR. C’est la seule étape qui rend la création publique, et elle reste humaine.
7. **Une adresse publique en lecture seule.** La création se lit à `/composition/<id>`, grâce à une réécriture dans `vercel.json` vers `creation.html`. Hors Vercel, elle se lit à `/creation?id=<id>`.
8. **L’ouverture depuis .0NE.** .0NE ouvre cette adresse à partir de la référence `{"format":"atlas-reference","version":1,"type":"composition","id":"<id>"}`. Le fichier `creations/<id>.json` est servi avec `Access-Control-Allow-Origin: *` : .0NE peut vérifier qu’il existe avant d’ouvrir la création, sans rien recopier.

## Ce que contient une création publiée

`format`, `version`, `id`, `titre`, `description`, `publieLe` (la date, sans l’heure), `visibility: "public"`, `publicationStatus: "publie"`, `blocs`, `liens`, `mise`.

Chaque bloc contient seulement :
- `uid`, renuméroté `p1`, `p2`… ;
- `type` et `ref`, qui renvoient aux fichiers de données publics de l’atlas (briques, modules, visuels, projets) ;
- `x`, `y`, `w`, `h` ;
- `style` et `visuel`, s’ils ont été choisis ;
- `intentions`, des mots du lexique du moteur ;
- `parts`, pour une fusion.

**N’y sont jamais :**
- les phrases des demandes et les informations reconnues (qui, quand, où, combien) ;
- les données saisies dans les modules (moments, invités, documents, montants) ;
- les réglages d’image et l’état « complété » ;
- les archives privées, les références LIFEBOOK et tout le reste du stockage local.

## La lecture, et les refus

`ATLAS.publication.valider(pub, id)` est utilisée à la préparation **et** à la lecture. Une création refusée n’affiche rien. La page dit pourquoi :

| Cas | Message |
| --- | --- |
| Identifiant mal formé (autre chose que des minuscules, des chiffres et des tirets) | « Cette adresse est invalide… » |
| Aucun fichier `creations/<id>.json` | « Cette création est absente… » |
| `visibility` différent de `public` | « Cette création est privée… » |
| `publicationStatus` différent de `publie` | « Cette création n’est pas publiée… » |
| Champ non autorisé, référence inconnue de l’atlas, bloc hors de la grille, lien vers un bloc absent | « Cette création est invalide… » |
| Fichier modifié après sa préparation (l’empreinte ne correspond plus) | « Cette création est invalide… » |

La page de lecture ne lit ni n’écrit le stockage local : ouvrir une création ne touche jamais à votre propre composition.

## Les fichiers de `creations/`

- `demonstration-un-concert-en-deux-demandes-c010df.json` : la composition de démonstration, non sensible. Elle a été produite par le vrai parcours, à partir de l’exemple « Un concert » du +, le 30/10/2026.
- `essai-privee.json` et `essai-brouillon.json` : des fichiers d’essai, qui **doivent être refusés** à la lecture. Ce ne sont pas des créations.

## Les limites

- **Pas de serveur ni de compte.** Publier, c’est ajouter un fichier au dépôt. Retirer une création, c’est supprimer son fichier.
- **Une création publiée est figée.** Pour la changer, on prépare une nouvelle version, qui reçoit un nouvel identifiant.
- **Les modules s’affichent par leur rôle seulement**, sans données : une création montre une forme, pas un contenu.

## Les tests

```
node --test tests/publication.test.mjs         # les fonctions pures, et la validité des fichiers de creations/
node tests/serveur.mjs 8090 &                  # le site servi comme Vercel (cleanUrls, redirections, réécritures)
BASE=http://localhost:8090 DEMO=demonstration-un-concert-en-deux-demandes-c010df \
  NAVIGATEURS=chromium,webkit,firefox python3 tests/e2e_parcours.py
```

Contre un déploiement d’aperçu protégé, ajoutez `SUFFIXE="_vercel_share=…"`.
