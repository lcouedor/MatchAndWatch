// app/Controllers/Http/RoomController.ts
import Room from "App/Models/Room";
import Watcher from "App/Models/Watcher";
import BucketRoom from "App/Models/BucketRoom";
import TMDBService from "App/Services/TMDBService";
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

const tmdbService = new TMDBService();

//TODO mettre ça dans un fichier de config
const ROOM_MAX_SIZE: number = 10; // Maximum number of watchers in a room

export default class RoomController {
    public async create({ request, response }: HttpContextContract) {
        try {
            const { bucket_size } = request.only(['bucket_size']) as { bucket_size: number }

            // Génère un code unique pour la room
            const code: string = await Room.createCode()

            // Crée la room
            const room: Room = await Room.create({ code, bucket_size })

            const films_number_factor: number = 4
            const nbFilms: number = bucket_size * films_number_factor

            // Récupère des films aléatoires via l'API TMDB
            const films: TMDBFilm[] = await tmdbService.getRandomFilms(nbFilms)

            // Ajoute chaque film dans la table bucket_rooms liée à la room
            // Ici on utilise Promise.all pour attendre toutes les créations
            await Promise.all(
                films.map(async (film: TMDBFilm) => {
                    await BucketRoom.create({
                        room_id: room.id,
                        film_id: film.id,
                    })
                })
            )

            return response.status(201).json(room)
        } catch (error) {
            console.error(error)
            return response.status(500).json({ error: 'Could not create room' })
        }
    }

    public async join({ request, response }: HttpContextContract) {
        try {
            const { code, watcher_name } = request.only(['code', 'watcher_name']) as {
                code: string
                watcher_name: string
            }

            const room: Room | null = await Room.findBy('code', code)
            if (!room) {
                return response.status(404).json({ error: 'Room not found' })
            }

            // On vérifie si la room est pleine
            const watchers: Watcher[] = await room.related('watchers').query()
            if (watchers.length >= ROOM_MAX_SIZE) {
                return response.status(400).json({ error: 'Room is full' })
            }

            // On crée un watcher
            const watcher: Watcher = await Watcher.create({ name: watcher_name, room_id: room.id })

            // On ajoute le watcher à la room (optionnel ici, car create l'ajoute déjà normalement)
            await room.related('watchers').save(watcher)

            // TODO: socket.io emit pour informer les watchers
            // io.emit(`updateRoom:${code}`, 'update')

            return response.status(200).json({
                success: true,
                watcher,
                roomCode: room.code,
                message: `Watcher with id ${watcher.id} joined room with code ${code}`,
            })
        } catch (error) {
            console.error(error)
            return response.status(500).json({ error: 'Could not join room' })
        }
    }

}
