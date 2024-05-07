'use strict'

const Room = use('App/Models/Room')
const Watcher = use('App/Models/Watcher')
const FilmsRoom = use('App/Models/FilmsRoom')
const BucketRoom = use('App/Models/BucketRoom')
const TMDBService = use('App/Services/TMDBService')

const Server = use('Server');
const io = require('socket.io')(Server.getInstance(), {
	cors: {
		origin: '*', // Autorise toutes les origines
	},
});

class RoomController {
	/**
	 * Create a new room.
	 *
	 * @param {Object} ctx - The context object containing the request and response objects.
	 * @param {Object} ctx.request - The request object.
	 * @param {Object} ctx.response - The response object.
	 * @returns {Object} The created room object.
	 */
	async create({ request, response }) {
		try {
			const { room_size, bucket_size } = request.only(['room_size', 'bucket_size'])
			const code = await Room.createCode()
			const room = await Room.create({ code, room_size, bucket_size })

			//On récupère des films aléatoires depuis l'API TMDB
			const tmdbService = new TMDBService(process.env.TMDB_API_KEY)
			//TODO mettre les variables dans un fichier dédié, comme ici pour la taille max du bucket et de la room
			const films = await tmdbService.getRandomMovies(Math.min(bucket_size, 10) * Math.min(room_size, 5))
			console.log('Movies:', films)

			//On ajoute des lignes dans la table films_rooms pour chaque film
			for (let film of films) {
				await FilmsRoom.create({ room_id: room.id, film_id: film.id })
			}

			return response.status(201).json(room)
		} catch (error) {
			console.error(error)
			return response.status(500).json({ error: 'Could not create room' })
		}
	}

	/**
	 * Delete a room.
	 * Cela supprime également tous les watchers de la room de la base de données.
	 *
	 * @param {Object} ctx - The context object containing the request and response objects.
	 * @param {Object} ctx.request - The request object.
	 * @param {Object} ctx.response - The response object.
	 * @returns {Object} The response object with the status and message.
	 */
	async delete({ request, response }) {
		try {
			const { id } = request.only(['id'])
			const room = await Room.find(id)
			if (!room) {
				return response.status(404).json({ error: 'Room not found' })
			}

			//On supprime chaque watcher de la base de données
			const watchers = await room.watchers().fetch()
			for (let watcher of watchers.rows) {
				await watcher.delete()
			}

			await room.delete()
			return response.status(200).json({ success: true, message: 'Room with id ' + id + ' deleted successfully' })
		} catch (error) {
			console.error(error)
			return response.status(500).json({ error: 'Could not delete room' })
		}
	}

	/**
	 * Get a list of all rooms.
	 *
	 * @param {object} ctx - The context object.
	 * @param {object} ctx.response - The response object.
	 * @returns {object} - The response object with the list of rooms or an error message.
	 */
	async index({ response }) {
		try {
			const rooms = await Room.all()
			return response.status(200).json(rooms)
		} catch (error) {
			console.error(error)
			return response.status(500).json({ error: 'Could not list rooms' })
		}
	}

	/**
	 * Get a room by its code.
	 *
	 * @param {Object} ctx - The context object containing the request parameters and response object.
	 * @param {Object} ctx.params - The request parameters.
	 * @param {string} ctx.params.code - The code of the room to retrieve.
	 * @param {Object} ctx.response - The response object to send the result.
	 * @returns {Promise<Object>} The room object with the specified code and its associated watchers.
	 * @throws {Error} If there is an error retrieving the room.
	 */
	async getByCode({ params, response }) {
		try {
			const { code } = params
			let room = await Room.findBy('code', code)
			if (!room) {
				return response.status(404).json({ error: 'Room not found' })
			}
			//N'afficher que les noms, id et étapes des watchers
			//N'afficher que les film_id des films
			const watchers = await room.watchers().fetch()
			const films = await room.films().fetch()
			room = room.toJSON()
			room.watchers = watchers.rows.map(watcher => {
				return { id: watcher.id, name: watcher.name, step: watcher.step }
			})

			//On ajoute les films à la room
			room.films = films.rows.map(film => film.film_id)

			//le bucket de la room
			const bucket = await BucketRoom.query().where('idRoom', room.id).fetch()
			room.bucket = bucket.rows.map(bucket => {
				return { id: bucket.id, idFilm: bucket.idFilm, weight: bucket.weight }
			})

			return response.status(200).json(room)
		} catch (error) {
			console.error(error)
			return response.status(500).json({ error: 'Could not get room' })
		}
	}

	/**
	 * Join a room as a watcher.
	 * Cette méthode crée un watcher et l'ajoute à la room.
	 * Si la room est déjà pleine, un message d'erreur est renvoyé.
	 * 
	 * @param {Object} ctx - The context object containing the request and response objects.
	 * @param {Object} ctx.request - The request object.
	 * @param {Object} ctx.response - The response object.
	 * @returns {Object} The response object with the status and message.
	 */
	async join({ request, response }) {
		io.emit('newMessage', 'coucou bouh')
		try {
			const { code, watcher_name } = request.only(['code', 'watcher_name'])

			const room = await Room.findBy('code', code)
			if (!room) {
				return response.status(404).json({ error: 'Room not found' })
			}

			//On vérifie si la room est pleine
			const watchers = await room.watchers().fetch()
			if (watchers.rows.length >= room.room_size) {
				return response.status(400).json({ error: 'Room is full' })
			}

			//On crée un watcher
			const watcher = await Watcher.create({ name: watcher_name, idRoom: room.id })

			return response.status(200).json({ success: true, message: 'Watcher with id ' + watcher.id + ' joined room with code ' + code })
		} catch (error) {
			console.error(error)
			return response.status(500).json({ error: 'Could not join room' })
		}
	}

	/**
	 * Leave a room.
	 * Cette méthode supprime également le watcher de la base de données.
	 *
	 * @param {Object} ctx - The context object containing the request and response objects.
	 * @param {Object} ctx.request - The request object.
	 * @param {Object} ctx.response - The response object.
	 * @returns {Object} The response object with the status and message.
	 */
	async leave({ request, response }) {
		try {
			const { code, watcher_id } = request.only(['code', 'watcher_id'])

			const room = await Room.findBy('code', code)

			if (!room) {
				return response.status(404).json({ error: 'Room not found' })
			}

			const watcher = await Watcher.find(watcher_id)
			if (!watcher) {
				return response.status(404).json({ error: 'Watcher not found' })
			}

			//On vérifie si le watcher est déjà dans la room
			const isWatcherInRoom = await Room.isWatcherIsInRoom(watcher, room)
			if (!isWatcherInRoom) {
				return response.status(400).json({ error: 'Watcher is not in the room' })
			}

			//On supprime le watcher de la base de données
			//Le watcher se trouve avec id et non watcher_id
			await watcher.delete()

			return response.status(200).json({ success: true, message: 'Watcher with id ' + watcher_id + ' left room with code ' + code })
		} catch (error) {
			console.error(error)
			return response.status(500).json({ error: 'Could not leave room' })
		}
	}

	async watcherAddFilmsToBucket({ request, response }) {
		try {
			const { code, watcher_id, films } = request.only(['code', 'watcher_id', 'films'])

			const room = await Room.findBy('code', code)

			if (!room) {
				return response.status(404).json({ error: 'Room not found' })
			}

			const watcher = await Watcher.find(watcher_id)
			if (!watcher) {
				return response.status(404).json({ error: 'Watcher not found' })
			}

			//On vérifie si le watcher est déjà dans la room
			const isWatcherInRoom = await Room.isWatcherIsInRoom(watcher, room)
			if (!isWatcherInRoom) {
				return response.status(400).json({ error: 'Watcher is not in the room' })
			}

			//Si le watcher tente d'ajouter des films alors qu'il n'est pas à l'étape 1
			if (watcher.step !== 1) {
				return response.status(400).json({ error: 'Watcher has already added films to bucket' })
			}

			//Si le watcher tente d'ajouter plus de films que la taille du bucket de la room
			const bucketSize = room.bucket_size
			if (films.length > bucketSize) {
				return response.status(400).json({ error: 'Too many films added to bucket' })
			}

			//On vérifie si le film est bien dans les films de la room
			const filmsRoom = await room.films().fetch()
			const filmsRoomIds = filmsRoom.rows.map(film => film.film_id)
			for (let film of films) {
				if (!filmsRoomIds.includes(film)) {
					return response.status(400).json({ error: 'Film with id ' + film + ' is not in the room' })
				}
			}

			//On supprime les doublons dans les films (films ajoutés par le même watcher)
			const uniqueFilms = [...new Set(films)]

			//On récupère les films déjà présents dans le bucket de la room
			const existingBucket = await BucketRoom.query().where('idRoom', room.id).fetch()
			const existingBucketIds = existingBucket.rows.map(bucket => bucket.idFilm)

			//On ajoute les films au bucket de la room avec un poids de 0
			for (let film of uniqueFilms) {
				//On n'autorise pas de rajouter un film déjà présent dans le bucket
				if (existingBucketIds.includes(film)) {
					continue
				}
				await BucketRoom.create({ idRoom: room.id, idWatcher: watcher.id, idFilm: film, weight: 0 })
			}

			//Un fois qu'il a ajouté ses films, il passe à l'étape suivante (2)
			watcher.step = 2
			await watcher.save()

			return response.status(200).json({ success: true, message: 'Films added to rooms\'s bucket' })
		} catch (error) {
			console.error(error)
			return response.status(500).json({ error: 'Could not add films to bucket' })
		}
	}

	async watcherVoteForFilm({ request, response }) {
		try {
			const { code, watcher_id, films } = request.only(['code', 'watcher_id', 'films'])

			const room = await Room.findBy('code', code)

			if (!room) {
				return response.status(404).json({ error: 'Room not found' })
			}

			const watcher = await Watcher.find(watcher_id)
			if (!watcher) {
				return response.status(404).json({ error: 'Watcher not found' })
			}

			//On vérifie si le watcher est déjà dans la room
			const isWatcherInRoom = await Room.isWatcherIsInRoom(watcher, room)
			if (!isWatcherInRoom) {
				return response.status(400).json({ error: 'Watcher is not in the room' })
			}

			//On vérifie que tous les watchers de la room soient à l'étape 2
			if (await Room.minStep(room) < 2) {
				return response.status(400).json({ error: 'Not all watchers have added films to the bucket' })
			}

			//Si le watcher tente de voter pour des films alors qu'il n'est pas à l'étape 2
			if (watcher.step !== 2) {
				return response.status(400).json({ error: 'Watcher is not at the right step to vote for films' })
			}

			let bucket = await BucketRoom.query().where('idRoom', room.id).fetch()
			//On vérifie que tous les films votés sont bien dans le bucket
			const bucketIds = bucket.rows.map(bucket => bucket.idFilm)
			for (let film of films) {
				if (!bucketIds.includes(film.id)) {
					return response.status(400).json({ error: 'Film with id ' + film.id + ' is not in the bucket' })
				}
			}

			//On supprime les doublons dans les films donnés pour le vote
			let uniqueFilms = []
			let uniqueFilmsIds = []
			for (let film of films) {
				if (!uniqueFilmsIds.includes(film.id)) {
					uniqueFilms.push(film)
					uniqueFilmsIds.push(film.id)
				}
			}

			//On incrémente le poids des films votés
			for (let film of uniqueFilms) {
				let bucketFilm = bucket.rows.find(bucket => bucket.idFilm === film.id)
				bucketFilm.weight += film.weight
				await bucketFilm.save()
			}

			//Le watcher a voté, il passe à l'étape suivante (3)
			watcher.step = 3
			await watcher.save()

			//TODO regarder si tous les watchers ont voté pour passer aux résultats

			return response.status(200).json({ success: true, message: 'Films voted successfully' })
		} catch (error) {
			console.error(error)
			return response.status(500).json({ error: 'Could not vote for films' })
		}
	}

}

module.exports = RoomController
