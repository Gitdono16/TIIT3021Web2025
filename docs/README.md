
TIIT3021Web2025 — Dumortier Donovan — B3Q1

Page de connexion sécurisée (Email + Mot de passe)  
Authentification avec JWT  
Page Dashboard affichant tous les projets  
Création automatique de dépôts GitHub :
- Vérifie si l'organisation existe
- Génère automatiquement Groupe01, Groupe02 , ... en fonction de l'organisation.
- Ajoute un token unique pour inscription.
- Choix de la couleur d’affichage dans le tableau de bord.

Sur le projet, on peut :
--> Modifier  
--> Copier le lien étudiant
--> Supprimer

L'étudiant accède au projet via un lien unique:

Il entre son pseudo GitHub :
- Vérification via l’API GitHub
- L ajoute automatiquement dans le groupe
- Invitation GitHub envoyée par mail
- Si déja inscrit, on refuse
- Refus si le groupe est complet


Technologie :

Node.js Serveur backend
Express Routes + API
MongoDB pour la base de données
JWT Connexion sécurisée
BcryptHash du mot de passe professeur
Octokit Création de dépôts GitHub + invitations
React + TypeScript + Vite** l interface frontend
TailwindCSS Design
Axios pour Requêtes API


Déploiement :

Backend : Sur render
Frontend : Github pages

Pour l'instalation :

Dans le dossier backend on installe les dépendances suivantes :
npm install:

express
cors
mongoose
dotenv
helmet  
jsonwebtoken
bcryptjs
body-parser
@octokit/rest

npm install -D nodemon typescript ts-node @types/express @types/node @types/jsonwebtoken

Dans le dossier frontend, on installe :

npm install react react-dom react-router-dom axios
npm install -D typescript @types/react @types/react-dom @types/react-router-dom

TailwindCSS:
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

Dans le fichier tailwind.config.js, on ajoute cette configuration :
content: [ "./src/**/*.{js,jsx,ts,tsx}", ],
Cela permet que tailwind soit activer dans toutes l’application. Et dans src/index.css,
on importe les styles :  
@tailwind base;  
@tailwind components;  
@tailwind utilities;

Pour la partie sécurité :

Tous les mots de passe sont hashés avec bcrypt
Les connexions utilisent les jetons JWT
Les routes prof sont protégées via PrivateRoute
CORS restreint uniquement à :
GitHub Pages et Localhost
Helmet + RateLimit protège contre attaques courantes
Tokens GitHub stockés dans .env.





