import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Watcher from 'App/Models/Watcher'
import { AppError } from 'App/Exceptions/AppError'
import CreateWatcherValidator from 'App/Validators/CreateWatcherValidator'

export default class WatcherController {
  public async index({ response }: HttpContextContract) {
    try {
      const watchers = await Watcher.all()
      return response.status(200).json({ success: true, data: watchers })
    } catch (error) {
      return response.status(500).json({ success: false, error: 'Could not retrieve watchers' })
    }
  }

  public async create({ request, response }: HttpContextContract) {
    const { name, room_id } = await request.validate(CreateWatcherValidator)
    try {
      const watcher = await Watcher.create({ name, room_id })
      return response.status(201).json({ success: true, data: watcher })
    } catch (error) {
      return response.status(500).json({ success: false, error: 'Could not create watcher' })
    }
  }

  public async delete({ params, response }: HttpContextContract) {
    try {
      const watcher = await Watcher.find(params.id)
      if (!watcher) throw new AppError('Watcher not found', 404)
      await watcher.delete()
      return response.status(200).json({ success: true })
    } catch (error) {
      const status = error instanceof AppError ? error.status : 500
      return response.status(status).json({ success: false, error: error.message })
    }
  }
}
