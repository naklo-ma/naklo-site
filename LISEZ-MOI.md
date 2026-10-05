# Site Naklo

Site statique (HTML, CSS, JavaScript) : pas de serveur, pas de base de données, pas d'abonnement. Tout le classement se fait dans le navigateur, donc aucun coût par visite.

## Les pages

| Adresse | Page |
| --- | --- |
| `/` | Accueil : promesse, situations, listes, villes, à propos |
| `/casablanca/` | Demande à Nakli pour Casablanca (Demander, En groupe, Surprends-moi, Les adresses) |
| `/rabat/`, `/marrakech/`, `/tanger/` | « Nakli arrive bientôt » |
| `/listes/?ville=casablanca` | Toutes les listes à thème |
| `/listes/?ville=casablanca&l=apres-minuit` | Une liste |
| `/restaurants/` | Partenariats et formulaire de contact (ouvre un e-mail prêt à envoyer) |
| `/demande/` | Lien court pour la bio : renvoie vers l'outil de la ville |
| `/favoris/` | Les adresses gardées avec le cœur (sur le téléphone, sans compte) |
| `/404.html` | Page « Nakli s'est perdu », affichée automatiquement par Netlify ou Cloudflare Pages pour toute adresse inconnue |

Raccourcis pour les posts : `/casablanca/?quand=Après minuit&go=1`, `/casablanca/?qui=Date&n=2&budget=< 250 DH&go=1`, `/casablanca/?surprise=1`, `/casablanca/?mode=groupe`.

## Mettre à jour

- **Ajouter ou corriger une adresse** : `data/casablanca.js`, une ligne par adresse (le format est rappelé en haut du fichier).
- **Ajouter une liste à thème** : `data/villes.js`, section `NAKLO_LISTES`. Pour un nouveau post : mets l'image dans `assets/posts/` (JPEG ~720 px de large), indique-la dans `post`, et mets les `id` des restos du post dans `ids` (ils s'affichent en premier, dans le même ordre).
- **Ouvrir une ville** : les 3 étapes sont en haut de `data/villes.js`.
- **Mettre une adresse en avant (partenaire payant)** : ajouter `partenaire:true` sur sa ligne. Elle reçoit l'étiquette « Partenaire », son classement ne change pas.

## Mettre en ligne (gratuit)

Netlify, Cloudflare Pages ou GitHub Pages : on y dépose le dossier `site/`. Ensuite, on relie le nom de domaine (naklo.ma, s'il est libre) et on met `https://naklo.ma/demande/` dans le lien en bio.
