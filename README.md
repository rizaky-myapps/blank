# BLANK

Site statique (HTML / CSS / JavaScript, sans dépendance ni étape de build).

## Lancer en local

```sh
python3 -m http.server 8080
```

Puis ouvrir http://localhost:8080.

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page d'accueil |
| `connexion.html` | Connexion à l'espace client |
| `compte.html`, `operations.html`, `prelevements.html`, `virements.html`, `rib.html` | Espace client |
| `assets/js/data.js` | Identité, comptes, IBAN, mandats et génération de l'historique |
| `assets/css/style.css` | Styles |

Pour modifier le titulaire, l'IBAN, les soldes, les mandats de prélèvement ou les identifiants de connexion, éditer `assets/js/data.js`.

Le site s'héberge tel quel sur n'importe quel serveur de fichiers statiques.
