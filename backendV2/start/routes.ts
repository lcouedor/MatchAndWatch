/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { message: 'Bienvenue sur Match & Watch' }
})


//Routes des rooms
Route.post('/room', 'RoomController.create')
Route.delete('/room', 'RoomController.delete')
Route.get('/room', 'RoomController.index')
Route.post('/room/join', 'RoomController.join')
Route.get('/room/:code', 'RoomController.getByCode')
Route.delete('/room/leave', 'RoomController.leave')
Route.post('/room/addFilmBucket', 'RoomController.watcherAddFilmsToBucket')
Route.post('/room/voteForFilm', 'RoomController.watcherVoteForFilm')

//Routes des watchers
Route.post('/watcher', 'WatcherController.create')
Route.delete('/watcher/:id', 'WatcherController.delete')
Route.get('/watcher', 'WatcherController.index')

//Routes annexes
Route.get('/movie', 'RoomController.getMovie')

Route.any('*', async ({ request, response }) => {
  if (request.method() === 'OPTIONS') {
    return response.status(204).send('')
  }

  return response.status(404).send('Route not found')
})