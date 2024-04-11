'use strict'

const Watcher = use('App/Models/Watcher')

class WatcherController {
    async create({ request, response }) {
        try {
            const { name } = request.only(['name'])
            const watcher = await Watcher.create({ name })
            return response.status(201).json(watcher)
        } catch (error) {
            console.error(error)
            return response.status(500).json({ error: 'Could not create watcher' })
        }
    }

    async delete({ params, response }) {
        try {
            const { id } = params
            const watcher = await Watcher.find(id)
            if (!watcher) {
                return response.status(404).json({ error: 'Watcher not found' })
            }
            await watcher.delete()
            return response.status(200).json({ success: true, message: 'Watcher with id '+ id +' deleted successfully' })
        } catch (error) {
            console.error(error)
            return response.status(500).json({ error: 'Could not delete watcher' })
        }
    }

    async index({ response }) {
        try {
            const watchers = await Watcher.all()
            return response.status(200).json(watchers)
        } catch (error) {
            console.error(error)
            return response.status(500).json({ error: 'Could not list watchers' })
        }
    }

    
}

module.exports = WatcherController
