'use strict'

const Room = use('App/Models/Room')
const Watcher = use('App/Models/Watcher')
const TMDBService = use('App/Services/TMDBService')

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
			const movies = await tmdbService.getRandomMovies(Math.min(bucket_size,10)*Math.min(room_size, 5))
			console.log('Movies:', movies)

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

			//On supprime la jointure entre les watchers et la room
			await room.watchers().detach()

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
			const room = await Room.findBy('code', code)
			if (!room) {
				return response.status(404).json({ error: 'Room not found' })
			}
			//On retourne la room et les watchers qui sont dedans, et l'étape actuelle de chaque watcher
			room.watchers = await room.watchers().fetch()
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
			const watcher = await Watcher.create({ name: watcher_name })

			await room.watchers().attach(watcher.id, { step: 0 })

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

			await room.watchers().detach(watcher_id)

			//On supprime le watcher
			await watcher.delete()

			return response.status(200).json({ success: true, message: 'Watcher with id ' + watcher_id + ' left room with code ' + code })
		} catch (error) {
			console.error(error)
			return response.status(500).json({ error: 'Could not leave room' })
		}
	}
}

module.exports = RoomController
