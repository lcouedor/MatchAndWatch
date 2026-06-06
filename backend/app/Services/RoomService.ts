import { translate } from 'bing-translate-api'
import Database from '@ioc:Adonis/Lucid/Database'
import Room from 'App/Models/Room'
import Watcher from 'App/Models/Watcher'
import BucketRoom from 'App/Models/BucketRoom'
import FilterVote from 'App/Models/FilterVote'
import TMDBService from 'App/Services/TMDBService'
import Ws from 'App/Services/Ws'
import { AppError } from 'App/Exceptions/AppError'
import gameConfig from 'Config/game'
import type { Room as RoomType, FilterMode } from 'SharedTypes/room'
import type { TMDBFilm, TMDBFilmDetails } from 'SharedTypes/tmdb'
import type { Filters } from 'SharedTypes/filters'
import { DEFAULT_FILTERS } from 'SharedTypes/filters'

const tmdbService = new TMDBService()

export default class RoomService {
  public async createRoom(
    bucketSize: number,
    filterMode: FilterMode = 'creator',
    filters: Filters | null = null,
    stepTimeout: number | null = null
  ): Promise<Room> {
    const code = await Room.createCode()

    // En mode créateur, on utilise les filtres fournis ou les défauts
    // En mode vote, filters reste null jusqu'à l'agrégation des votes
    const resolvedFilters = filterMode === 'creator' ? (filters ?? DEFAULT_FILTERS) : null

    const room = await Room.create({
      code,
      bucket_size: bucketSize,
      filter_mode: filterMode,
      filters: resolvedFilters,
      step_timeout: stepTimeout,
    })

    if (filterMode === 'creator') {
      const films: TMDBFilm[] = await tmdbService.getRandomFilms(bucketSize * 2, resolvedFilters!)
      await Promise.all(
        films.map((film) => BucketRoom.create({ room_id: room.id, film_id: film.id }))
      )
    }

    return room
  }

  public async submitFilterVote(
    code: string,
    watcherId: number,
    filters: Filters
  ): Promise<boolean> {
    const room = await Room.findBy('code', code)
    if (!room) throw new AppError('Room not found', 404)
    if (room.filter_mode !== 'vote') throw new AppError('Room is not in vote filter mode', 400)
    if (room.filters !== null) throw new AppError('Filters are already locked', 400)

    const watcher = await Watcher.find(watcherId)
    if (!watcher) throw new AppError('Watcher not found', 404)

    const isInRoom = await Room.isWatcherIsInRoom(watcher, room)
    if (!isInRoom) throw new AppError('Watcher is not in the room', 400)

    // Upsert le vote
    const existing = await FilterVote.query()
      .where('room_id', room.id)
      .where('watcher_id', watcherId)
      .first()

    if (existing) {
      await existing.merge({ filters }).save()
    } else {
      await FilterVote.create({ room_id: room.id, watcher_id: watcherId, filters })
    }

    // Vérifie si tous les watchers ont voté
    const watchers = await room.related('watchers').query()
    const votes = await room.related('filterVotes').query()

    if (votes.length < watchers.length) {
      Ws.io.sockets.emit(`updateRoom:${code}`, { display: false, message: '', filterVoteCount: votes.length })
      return false
    }

    // Agrégation : médiane pour les numériques, union pour les genres
    const aggregated = this.aggregateFilters(votes.map((v) => v.filters))
    await room.merge({ filters: aggregated }).save()

    // Peuple le bucket maintenant que les filtres sont définis
    const films: TMDBFilm[] = await tmdbService.getRandomFilms(room.bucket_size * 2, aggregated)
    await Promise.all(
      films.map((film) => BucketRoom.create({ room_id: room.id, film_id: film.id }))
    )

    Ws.io.sockets.emit(`updateRoom:${code}`, { display: false, message: '' })
    return true
  }

  private aggregateFilters(filtersList: Filters[]): Filters {
    const median = (values: number[]): number => {
      const sorted = [...values].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    }

    const medianNullable = (values: (number | null)[]): number | null => {
      const nonNull = values.filter((v): v is number => v !== null)
      return nonNull.length > 0 ? median(nonNull) : null
    }

    const allGenres = filtersList.flatMap((f) => f.genres)
    const genres = [...new Set(allGenres)]

    return {
      vote_average_min: median(filtersList.map((f) => f.vote_average_min)),
      vote_average_max: median(filtersList.map((f) => f.vote_average_max)),
      release_year_min: median(filtersList.map((f) => f.release_year_min)),
      release_year_max: median(filtersList.map((f) => f.release_year_max)),
      vote_count_min: median(filtersList.map((f) => f.vote_count_min)),
      vote_count_max: medianNullable(filtersList.map((f) => f.vote_count_max ?? null)),
      runtime_min: medianNullable(filtersList.map((f) => f.runtime_min ?? null)),
      runtime_max: medianNullable(filtersList.map((f) => f.runtime_max ?? null)),
      genres,
    }
  }

  public async joinRoom(code: string, watcherName: string): Promise<Watcher> {
    const room = await Room.findBy('code', code)
    if (!room) throw new AppError('Code de room invalide', 404)

    const watchers = await room.related('watchers').query()
    if (watchers.length >= gameConfig.roomMaxSize) throw new AppError('Cette room est complète', 400)

    // Bloque si la première étape est déjà terminée
    if (room.filter_mode === 'vote' && room.filters !== null) {
      throw new AppError('Cette room a déjà commencé', 403)
    }
    if (watchers.length > 0) {
      const minStep = watchers.reduce((min, w) => Math.min(min, w.step), watchers[0].step)
      if (minStep >= 1) throw new AppError('Cette room a déjà commencé', 403)
    }

    const watcher = await Watcher.create({ name: watcherName, room_id: room.id })
    await room.related('watchers').save(watcher)

    Ws.io.sockets.emit(`updateRoom:${code}`, {
      display: true,
      message: `${watcherName} a rejoint la room`,
    })

    return watcher
  }

  public async leaveRoom(
    code: string,
    watcherId: number
  ): Promise<{ watcherName: string; roomDeleted: boolean }> {
    const room = await Room.findBy('code', code)
    if (!room) throw new AppError('Room not found', 404)

    const watcher = await Watcher.find(watcherId)
    if (!watcher) throw new AppError('Watcher not found', 404)

    const isInRoom = await Room.isWatcherIsInRoom(watcher, room)
    if (!isInRoom) throw new AppError('Watcher is not in the room', 400)

    const watcherName = watcher.name
    await watcher.delete()

    Ws.io.sockets.emit(`updateRoom:${code}`, {
      display: true,
      message: `${watcherName} a quitté la room`,
    })

    const remaining = await room.related('watchers').query()
    if (remaining.length === 0) {
      await room.delete()
      return { watcherName, roomDeleted: true }
    }

    return { watcherName, roomDeleted: false }
  }

  public async getRoomByCode(code: string): Promise<RoomType> {
    const room = await Room.findBy('code', code)
    if (!room) throw new AppError('Room not found', 404)

    await room.load('watchers')
    await room.load('bucket')

    const minStep = await Room.minStep(room)

    return { ...(room.serialize() as Omit<RoomType, 'minStep'>), minStep }
  }

  public async addFilmsToBucket(
    code: string,
    watcherId: number,
    step: number,
    filmIds: number[]
  ): Promise<void> {
    const room = await Room.findBy('code', code)
    if (!room) throw new AppError('Room not found', 404)

    const watcher = await Watcher.find(watcherId)
    if (!watcher) throw new AppError('Watcher not found', 404)

    await BucketRoom.query()
      .whereIn('film_id', filmIds)
      .where('room_id', room.id)
      .update({ is_active: true })

    await watcher.merge({ step }).save()

    Ws.io.sockets.emit(`updateRoom:${code}`, { display: false, message: '' })
  }

  public async voteForFilm(
    code: string,
    watcherId: number,
    films: { id: number; note: number }[]
  ): Promise<void> {
    const room = await Room.findBy('code', code)
    if (!room) throw new AppError('Room not found', 404)

    const watcher = await Watcher.find(watcherId)
    if (!watcher) throw new AppError('Watcher not found', 404)

    const isInRoom = await Room.isWatcherIsInRoom(watcher, room)
    if (!isInRoom) throw new AppError('Watcher is not in the room', 400)

    await Database.transaction(async (trx) => {
      for (const { id, note } of films) {
        const bucketFilm = await Database.from('buckets_rooms')
          .where('room_id', room.id)
          .where('film_id', id)
          .forUpdate()
          .useTransaction(trx)
          .first()

        if (!bucketFilm) continue

        await Database.from('buckets_rooms')
          .where('room_id', room.id)
          .where('film_id', id)
          .useTransaction(trx)
          .update({ weight: bucketFilm.weight + note })
      }
    })

    await watcher.merge({ step: watcher.step + 1 }).save()

    Ws.io.sockets.emit(`updateRoom:${code}`, { display: false, message: '' })
  }

  public async getMovieWithTranslation(movieId: number): Promise<TMDBFilmDetails> {
    const movie = await tmdbService.getFilmDetails(movieId)

    try {
      const result = await translate(movie.overview, 'en', 'fr')
      movie.overview = result?.translation || movie.overview
    } catch {
      // traduction non critique, on garde l'original
    }

    return movie
  }
}
