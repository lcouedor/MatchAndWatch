# matchAndWatch

Application pour déterminer le film le plus adapté à regarder en groupe

Fonctionnement : 
- Créer une room (une seule personne du groupe créé la room)
- Les autres rejoignent la room (grâce au code)
- Étape 1 : Swiper les films (jusqu'à liker autant de films qu'indiqué dans la configuration de la room, ou passer tous les films proposés)
- Étape 2 : Une fois que tout le monde a swiper, on vote parmi tous les films likés par tous les membres de la room
- Étape 3 : Le film le plus adapté pour tout le monde est déterminé selon les votes

On ne peut pas rejoindre une room une fois l'étape 2 atteinte par tout ceux déjà présents.

# Backend
AdonisJS

- Sélection de films aléatoires via TMDB
- Traduction automatique des descriptions de film côté backend avec l'API bing-translate (actuellement EN-FR, plus de langues à venir)
- Sockets avec socket-io pour synchroniser les différents participants

Lancement : ‘npm start‘
Port : 3333

# Frontend
VueJS + TS

- Call API avec Axios

Lancement : ‘npm run serve‘ ou ‘npm run build‘

## !!Application actuellement en version POC!!