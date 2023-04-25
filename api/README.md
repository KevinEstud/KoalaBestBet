
# Back-End
Ceci est la partie back-end de l'application.


# Requirements

PostgreSQL 14.2 (Ubuntu 14.2-1.pgdg20.04+1+b1)

Node v16.16.0

# Installation
Rendez-vous dans le dossier et complétez successivement ces étapes . 

Installez les dépendances.
`npm i`
Personnalisez le .env

  

```
PG_HOST=
PG_USER=
PG_PASS=
PG_DATABASE=
PANDA_KEY=
JWT_SIGN_SECRET=
JWT_REFRESH_SECRET=
RECAPTCHA_SECRET_KEY=
ADMIN_EMAIL=
SMTP_HOST=
SMTP_PORT=
SMTP_MAIL=
SMTP_PASS=

```

Et enfin démarrez le script.
`npm run start`

# Crédits

Cette API a été crée à l'aide de l'api de pandascore, une api permettant de récupérer des score de différents matchs se déroulant sur différents jeux [pandascore](https://pandascore.co/).