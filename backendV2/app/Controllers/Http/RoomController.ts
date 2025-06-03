// app/Controllers/Http/RoomController.ts
import Room from "App/Models/Room";
import BucketRoom from "App/Models/BucketRoom";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import TMDBService from "App/Services/TMDBService";

const tmdbService = new TMDBService();

export default class RoomController {
    public async test({ response }: HttpContextContract) {
        try {
            const watchers = await Room.all();
            return response.status(200).json(watchers);
        } catch (error) {
            console.error(error);
            return response
                .status(500)
                .json({ error: "Could not get watchers" });
        }
    }

    async create({ request, response }) {
        try {
            const { bucket_size } = request.only([
                "bucket_size",
            ]);
            const code: string = await Room.createCode();
            const room: Room = await Room.create({ code, bucket_size });
            const films_number_factor: number = 4;

            //On récupère des films aléatoires depuis l'API TMDB
            let nbFilms: number = bucket_size * films_number_factor;
            const films: TMDBFilm[] = await tmdbService.getRandomFilms(nbFilms);

            //On ajoute des lignes dans la table films_rooms pour chaque film
            films.forEach(async (film: TMDBFilm) => {
                await BucketRoom.create({
                    room_id: room.id,
                    film_id: film.id,
                });
            });

            return response.status(201).json(room);
        } catch (error) {
            console.error(error);
            return response
                .status(500)
                .json({ error: "Could not create room" });
        }
    }
}
