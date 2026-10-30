# Administration de la chronologie

## Ce qui existe aujourd’hui

- **`admin.html`** est un éditeur **local**. Il n’existe encore ni serveur ni authentification pour l’atlas. L’éditeur ne simule donc aucune connexion.
- Les modifications, les brouillons, les archives privées et les références LIFEBOOK restent dans le navigateur qui les a saisies :
  - le texte dans `localStorage`, sous la clé `atlas-admin-v1` ;
  - les images dans IndexedDB (base `atlas-coffre`, voir `js/coffre.js`).
- **Publier** enregistre une version dans l’éditeur. Le bouton télécharge aussi `chronologie.js`, filtré : seules les entrées et les archives publiées y figurent, et les références LIFEBOOK et les pièces privées n’y entrent jamais. Ce fichier remplace `data/chronologie.js` par une pull request, puis Vercel le met en ligne.
- **Prévisualiser** ouvre `index.html?apercu=1`. Seul le navigateur de l’éditeur lit le brouillon ; un bandeau l’annonce.
- `/admin` est servi avec `X-Robots-Tag: noindex` et `Cache-Control: no-store`. La page ne contient aucun secret. Un visiteur qui l’ouvre n’édite que son propre navigateur.

## Le parcours demandé, étape par étape

| Étape | Aujourd’hui (local) | Avec le serveur proposé |
| --- | --- | --- |
| 1. Se connecter comme propriétaire | **Non disponible** : aucune authentification | Connexion contrôlée côté serveur |
| 2–7. Corriger 2002–2005, ajouter Saint-Luc, Yannick Carlier, Aldo Guillaume Turin, la vidéo, le téléviseur | Oui | Oui |
| 8. Prévisualiser | Oui, sur cet appareil | Oui, pour le propriétaire |
| 9–10. Publier et voir aussitôt | Une version locale et un fichier à déposer : le public le voit après la pull request | Immédiat |
| 11. Corriger sans toucher au code | Oui, dans l’éditeur ; le dépôt du fichier reste nécessaire | Oui |
| 12. Préparer une référence LIFEBOOK sans la publier | Oui : la référence reste privée, le corpus s’exporte en privé | Oui |

## Proposition : la vraie administration

L’atlas est déployé sur Vercel, à partir d’un dépôt **public**. Les archives privées ne doivent donc jamais entrer dans le dépôt.

1. **Données** : une base Postgres (Neon, raccordée au projet Vercel) avec les tables suivantes.
   - `timeline_entries` : les champs de `TimelineEntry` ci-dessous.
   - `archives`
   - `entry_archives` : la table de liaison, pour qu’une archive appartienne à plusieurs événements sans être copiée.
   - `relations`
   - `versions` : un instantané JSON par publication.
   - `audit_log` : qui, quand, quoi.
2. **Fichiers** : un magasin Vercel Blob privé pour les originaux. Une archive publiée reçoit une copie publique. Les autres ne sont servies qu’au propriétaire, par des adresses signées et courtes.
3. **Authentification**, entièrement côté serveur, dans des fonctions Vercel `api/` :
   - une connexion OAuth (Google, si c’est « la connexion habituelle » de lemondeaime.com, avec un client OAuth propre à l’atlas) ;
   - une liste d’autorisation réduite à l’identifiant du propriétaire ;
   - une session en cookie `HttpOnly`, `Secure`, `SameSite=Strict` ;
   - une protection CSRF sur chaque écriture.
   - Le code de lemondeaime.com n’est ni modifié ni partagé.
4. **Lecture publique** : `GET /api/chronologie` ne rend que les entrées publiées. Les brouillons ne quittent jamais la base.
5. **Écriture** : `PUT /api/entrees/:id`, `POST /api/publier` et `POST /api/restaurer/:version`. Chaque appel vérifie la session et écrit dans `audit_log`.
6. **Migration** : l’éditeur local exporte déjà le même format JSON. Le premier import alimente la base, et `data/chronologie.js` devient un repli hors ligne.

Ce qu’il faut de votre part, sans quoi rien ne doit être activé :

- votre accord sur ce choix ;
- la création du client OAuth et des variables d’environnement dans Vercel (identifiant du client, secret, secret de session, identifiant propriétaire) ;
- la base Neon et le magasin Blob privé.

## Le modèle

### TimelineEntry

| Champ | Contenu |
| --- | --- |
| `id`, `title` | identifiant et titre |
| `dateStart`, `dateEnd` | dates de début et de fin |
| `datePrecision` | `exacte`, `mois`, `annee`, `periode`, `approx`, `inconnue` |
| `educationPeriod` | période de formation |
| `narrative` | le récit |
| `people` | les personnes |
| `mediaIds`, `archiveIds` | médias et archives liés |
| `relatedProjectIds`, `relatedEntryIds` | projets et entrées liés |
| `lifebookRef` | référence LIFEBOOK, privée |
| `evidenceStatus` | `document`, `declare`, `a-verifier` |
| `visibility`, `publicationStatus` | visibilité et statut de publication |
| `layoutVariant`, `fond`, `bandeau`, `cadrage` | présentation |
| `video` | lien vidéo |
| `createdAt`, `updatedAt` | dates de création et de modification |

### Archive

| Champ | Contenu |
| --- | --- |
| `id`, `mediaType`, `title` | identifiant, type et titre |
| `originalDate`, `author`, `source` | date d’origine, auteur et source |
| `usageRights` | droits d’usage |
| `privacy` | `prive`, `publiable` ou `publie` |
| `storageRef`, `thumbnailRef` | fichier et vignette |
| `relatedEntryIds` | entrées liées |

### Relation

`{ de, vers, nature, justification, auteur }`. La justification est obligatoire : une relation est décrite, jamais déduite.

## LIFEBOOK

Ce qui a été vérifié dans le dépôt `aime-lifebook` :

- c’est un atelier statique dont les données restent dans le navigateur (IndexedDB) ;
- son `RemoteAdapter` est prévu mais pas branché ;
- il importe des corpus `aime-lifebook-corpus` version 1, privés par défaut, avec aperçu ;
- un identifiant existant n’y est jamais réécrit ;
- l’événement `evt_saint-luc` (« Études à Saint-Luc », date inconnue) y existe déjà.

L’atlas ne copie pas les événements. Il garde une référence `lifebookRef` vers l’identifiant LIFEBOOK. Son export de corpus fait deux choses :

- il **ajoute des sources** aux événements existants, par `links` ;
- il **propose** les autres événements sous des identifiants `evt_atlas_…`.

Rien n’est publié : LIFEBOOK reste privé par défaut.
