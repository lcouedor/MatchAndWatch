'use strict'

const Room = use('App/Models/Room')

class RoomController {
	async create({ request, response }) {
		try {
			const { room_size, bucket_size } = request.only(['room_size', 'bucket_size'])
			const code = await Room.createCode()
			const room = await Room.create({ code, room_size, bucket_size })
			return response.status(201).json(room)
		} catch (error) {
			console.error(error)
			return response.status(500).json({ error: 'Could not create room' })
		}
	}

	async delete({ params, response }) {
		try {
			const { id } = params
			const room = await Room.find(id)
			if (!room) {
				return response.status(404).json({ error: 'Room not found' })
			}
			await room.delete()
			return response.status(200).json({ success: true, message: 'Room with id '+ id +' deleted successfully' })
		} catch (error) {
			console.error(error)
			return response.status(500).json({ error: 'Could not delete room' })
		}
	}

	async index({ response }) {
		try {
			const rooms = await Room.all()
			return response.status(200).json(rooms)
		} catch (error) {
			console.error(error)
			return response.status(500).json({ error: 'Could not list rooms' })
		}
	}
}

module.exports = RoomController
