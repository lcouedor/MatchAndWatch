'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { message: 'Bienvenue sur Match&Watch' }
})

//Routes des watchers
Route.post('/watcher', 'WatcherController.create')
Route.delete('/watcher/:id', 'WatcherController.delete')
Route.get('/watcher', 'WatcherController.index')

//Routes des rooms
Route.post('/room', 'RoomController.create')
Route.delete('/room', 'RoomController.delete')
Route.get('/room', 'RoomController.index')
Route.post('/room/join', 'RoomController.join')
Route.get('/room/:code', 'RoomController.getByCode')
Route.delete('/room/leave', 'RoomController.leave')
Route.post('/room/addFilmBucket', 'RoomController.watcherAddFilmsToBucket')
Route.post('/room/voteForFilm', 'RoomController.watcherVoteForFilm')

//Routes annexes
Route.get('/movie', 'RoomController.getMovie')