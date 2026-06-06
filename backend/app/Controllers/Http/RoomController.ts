import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AppError } from 'App/Exceptions/AppError'
import RoomService from 'App/Services/RoomService'
import { DEFAULT_FILTERS } from 'SharedTypes/filters'
import type { Filters } from 'SharedTypes/filters'
import CreateRoomValidator from 'App/Validators/CreateRoomValidator'
import JoinRoomValidator from 'App/Validators/JoinRoomValidator'
import LeaveRoomValidator from 'App/Validators/LeaveRoomValidator'
import AddFilmsToBucketValidator from 'App/Validators/AddFilmsToBucketValidator'
import VoteForFilmValidator from 'App/Validators/VoteForFilmValidator'
import SubmitFilterVoteValidator from 'App/Validators/SubmitFilterVoteValidator'
import Ws from 'App/Services/Ws'

Ws.boot()

const roomService = new RoomService()

export default class RoomController {
  public async create({ request, response }: HttpContextContract) {
    const { bucket_size, filter_mode, filters, step_timeout } = await request.validate(CreateRoomValidator)
    try {
      const resolvedFilters: Filters | null = filters
        ? { ...DEFAULT_FILTERS, ...filters, vote_count_max: filters.vote_count_max ?? null, runtime_min: filters.runtime_min ?? null, runtime_max: filters.runtime_max ?? null } as Filters
        : null
      const room = await roomService.createRoom(bucket_size, filter_mode, resolvedFilters, step_timeout ?? null)
      return response.status(201).json({ success: true, data: room })
    } catch (error) {
      console.error('[RoomController.create] Error:', error)
      const status = error instanceof AppError ? error.status : 500
      return response.status(status).json({ success: false, error: error instanceof Error ? error.message : String(error) })
    }
  }

  public async join({ request, response }: HttpContextContract) {
    const { code, watcher_name } = await request.validate(JoinRoomValidator)
    try {
      const watcher = await roomService.joinRoom(code, watcher_name)
      return response.status(200).json({ success: true, data: watcher })
    } catch (error) {
      const status = error instanceof AppError ? error.status : 500
      return response.status(status).json({ success: false, error: error.message })
    }
  }

  public async leave({ request, response }: HttpContextContract) {
    const { code, watcher_id } = await request.validate(LeaveRoomValidator)
    try {
      const { watcherName, roomDeleted } = await roomService.leaveRoom(code, watcher_id)
      return response.status(200).json({
        success: true,
        message: `${watcherName} a quitté la room${roomDeleted ? ' (room supprimée)' : ''}`,
      })
    } catch (error) {
      const status = error instanceof AppError ? error.status : 500
      return response.status(status).json({ success: false, error: error.message })
    }
  }

  public async getByCode({ params, response }: HttpContextContract) {
    try {
      const room = await roomService.getRoomByCode(params.code)
      return response.status(200).json({ success: true, data: room })
    } catch (error) {
      const status = error instanceof AppError ? error.status : 500
      return response.status(status).json({ success: false, error: error.message })
    }
  }

  public async watcherAddFilmsToBucket({ request, response }: HttpContextContract) {
    const { code, watcher_id, step, filmIds, dislikedFilmIds } = await request.validate(AddFilmsToBucketValidator)
    try {
      await roomService.addFilmsToBucket(code, watcher_id, step, filmIds, dislikedFilmIds ?? [])
      return response.status(200).json({ success: true })
    } catch (error) {
      const status = error instanceof AppError ? error.status : 500
      return response.status(status).json({ success: false, error: error.message })
    }
  }

  public async watcherVoteForFilm({ request, response }: HttpContextContract) {
    const { code, watcher_id, films } = await request.validate(VoteForFilmValidator)
    try {
      await roomService.voteForFilm(code, watcher_id, films)
      return response.status(200).json({ success: true })
    } catch (error) {
      const status = error instanceof AppError ? error.status : 500
      return response.status(status).json({ success: false, error: error.message })
    }
  }

  public async submitFilterVote({ request, response }: HttpContextContract) {
    const { code, watcher_id, filters } = await request.validate(SubmitFilterVoteValidator)
    try {
      const resolvedFilters: Filters = {
        ...filters,
        vote_count_max: filters.vote_count_max ?? null,
        runtime_min: filters.runtime_min ?? null,
        runtime_max: filters.runtime_max ?? null,
      }
      const filtersLocked = await roomService.submitFilterVote(code, watcher_id, resolvedFilters)
      return response.status(200).json({ success: true, data: { filtersLocked } })
    } catch (error) {
      const status = error instanceof AppError ? error.status : 500
      return response.status(status).json({ success: false, error: error.message })
    }
  }

  public async getMovie({ request, response }: HttpContextContract) {
    try {
      const { movieId } = request.only(['movieId']) as { movieId: number }
      const movie = await roomService.getMovieWithTranslation(movieId)
      return response.status(200).json({ success: true, data: movie })
    } catch (error) {
      const status = error instanceof AppError ? error.status : 500
      return response.status(status).json({ success: false, error: error.message })
    }
  }

  // Routes non implémentées — conservées pour compatibilité
  public async delete({ response }: HttpContextContract) {
    return response.status(501).json({ success: false, error: 'Not implemented' })
  }

  public async index({ response }: HttpContextContract) {
    return response.status(501).json({ success: false, error: 'Not implemented' })
  }
}
