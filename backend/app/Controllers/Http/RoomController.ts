// app/Controllers/Http/RoomController.ts
import Room from "App/Models/Room";
import Watcher from "App/Models/Watcher";
import BucketRoom from "App/Models/BucketRoom";
import TMDBService from "App/Services/TMDBService";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import type { TMDBFilm, TMDBFilmDetails } from "../../../../shared-types/tmdb";
import { apiResponse } from "../../../../shared-types/apiResponse";
import type { Room as RoomType } from "../../../../shared-types/room";
import { translate } from "bing-translate-api";
import Ws from "App/Services/Ws";
import Database from "@ioc:Adonis/Lucid/Database";

const tmdbService = new TMDBService();

//TODO mettre ça dans un fichier de config
const ROOM_MAX_SIZE: number = 10; // Maximum number of watchers in a room

Ws.boot();

export default class RoomController {
    public async create({ request, response }: HttpContextContract) {
        try {
            const { bucket_size } = request.only(["bucket_size"]) as {
                bucket_size: number;
            };

            // Génère un code unique pour la room
            const code: string = await Room.createCode();

            // Crée la room
            const room: Room = await Room.create({ code, bucket_size });

            const films_number_factor: number = 1;
            const nbFilms: number = bucket_size * films_number_factor;

            // Récupère des films aléatoires via l'API TMDB
            const films: TMDBFilm[] = await tmdbService.getRandomFilms(nbFilms);

            // Ajoute chaque film dans la table bucket_rooms liée à la room
            // Ici on utilise Promise.all pour attendre toutes les créations
            await Promise.all(
                films.map(async (film: TMDBFilm) => {
                    await BucketRoom.create({
                        room_id: room.id,
                        film_id: film.id,
                    });
                }),
            );

            return response
                .status(201)
                .json({ success: true, data: room } as apiResponse<Room>);
        } catch (error) {
            return response.status(500).json({
                success: false,
                error: "Could not create room",
            } as apiResponse<Room>);
        }
    }

    public async join({ request, response }: HttpContextContract) {
        try {
            const { code, watcher_name } = request.only([
                "code",
                "watcher_name",
            ]) as {
                code: string;
                watcher_name: string;
            };

            const room: Room | null = await Room.findBy("code", code);
            if (!room) {
                return response.status(404).json({ error: "Room not found" });
            }

            // On vérifie si la room est pleine
            const watchers: Watcher[] = await room.related("watchers").query();
            if (watchers.length >= ROOM_MAX_SIZE) {
                return response.status(400).json({ error: "Room is full" });
            }

            // On crée un watcher
            const watcher: Watcher = await Watcher.create({
                name: watcher_name,
                room_id: room.id,
            });

            // On ajoute le watcher à la room (optionnel ici, car create l'ajoute déjà normalement)
            await room.related("watchers").save(watcher);

            Ws.io.sockets.emit(`updateRoom:${code}`, {
                display: true,
                message: `Le watcher ${watcher_name} a rejoint la room`,
            });

            return response
                .status(200)
                .json({ success: true, data: watcher } as apiResponse<Watcher>);
        } catch (error) {
            return response.status(500).json({
                success: false,
                error: "Could not join room",
            } as apiResponse<Watcher>);
        }
    }

    async leave({ request, response }) {
        try {
            const { code, watcher_id } = request.only(["code", "watcher_id"]);

            const room = await Room.findBy("code", code);

            if (!room) {
                return response.status(404).json({ error: "Room not found" });
            }

            const watcher = await Watcher.find(watcher_id);
            if (!watcher) {
                return response
                    .status(404)
                    .json({ error: "Watcher not found" });
            }

            //On vérifie si le watcher est déjà dans la room
            const isWatcherInRoom = await Room.isWatcherIsInRoom(watcher, room);
            if (!isWatcherInRoom) {
                return response
                    .status(400)
                    .json({ error: "Watcher is not in the room" });
            }

            //On supprime le watcher de la base de données
            await watcher.delete();

            //On émet un événement pour mettre à jour la room
            Ws.io.sockets.emit(`updateRoom:${code}`, {
                display: true,
                message: `Le watcher ${watcher.name} a quitté la room`,
            });

            const responseData: apiResponse<Watcher> = {
                success: true,
                message: `Watcher with id ${watcher_id} left room with code ${code}`,
            };

            //Si la room n'a plus de watcher, on la supprime
            const remainingWatchers = await room.related("watchers").query();
            if (remainingWatchers.length === 0) {
                await room.delete();
                responseData.message += " and the room was deleted.";
            }

            return response.status(200).json(responseData);
        } catch (error) {
            console.error(error);

            const responseData: apiResponse<Watcher> = {
                success: false,
                error: "Could not leave room",
            };

            return response.status(500).json(responseData);
        }
    }

    public async getByCode({ params, response }: HttpContextContract) {
        try {
            const { code } = params;

            let room: Room | null = await Room.findBy("code", code);
            if (!room) {
                return response.status(404).json({
                    success: false,
                    error: "Room not found",
                } as apiResponse<Room>);
            }
            // On charge les watchers et le bucket de la room
            await room.load("watchers");
            await room.load("bucket");

            const minStep = await Room.minStep(room);

            const roomTyped: RoomType = {
                ...(room.serialize() as Omit<RoomType, "minStep">),
                minStep,
            };

            return response.status(200).json({
                success: true,
                data: roomTyped,
            } as apiResponse<RoomType>);
        } catch (error) {
            return response.status(500).json({
                success: false,
                error: "Could not retrieve room",
            } as apiResponse<RoomType>);
        }
    }

    public async translate(text: string): Promise<string> {
        try {
            const result = await translate(text, "en", "fr");
            return typeof result === "string"
                ? result
                : (result?.translation ?? text);
        } catch {
            return text;
        }
    }

    public async getMovie({ request, response }: HttpContextContract) {
        try {
            const { movieId } = request.only(["movieId"]) as {
                movieId: number;
            };

            const movie: TMDBFilmDetails =
                await tmdbService.getFilmDetails(movieId);

            // On essaie de traduire la description du film en français si possible
            try {
                const translatedResult = await translate(
                    movie.overview,
                    "en",
                    "fr",
                );
                movie.overview =
                    translatedResult?.translation || movie.overview;
            } catch (error) {
                console.error(error);
            }

            return response.status(200).json({
                success: true,
                data: movie,
            } as apiResponse<TMDBFilmDetails>);
        } catch (error) {
            return response.status(500).json({
                success: false,
                error: "Could not retrieve movie details",
            } as apiResponse<TMDBFilmDetails>);
        }
    }

    public async watcherAddFilmsToBucket({
        request,
        response,
    }: HttpContextContract) {
        try {
            const { code, watcher_id, step, filmIds } = request.only([
                "code",
                "watcher_id",
                "step",
                "filmIds",
            ]) as {
                code: string;
                watcher_id: number;
                step: number;
                filmIds: number[];
            };

            const room: Room | null = await Room.findBy("code", code);
            if (!room) {
                return response.status(404).json({
                    success: false,
                    error: "Room not found",
                } as apiResponse<Room>);
            }

            // On vérifie si le watcher est dans la room
            const watcher: Watcher | null = await Watcher.find(watcher_id);
            if (!watcher) {
                return response.status(404).json({
                    success: false,
                    error: "Watcher not found",
                } as apiResponse<Watcher>);
            }

            //On passe is_active à true pour tous les ids de film présent dans filmIds
            await BucketRoom.query()
                .whereIn("film_id", filmIds)
                .where("room_id", room.id)
                .update({ is_active: true });

            //On passe le step du watcher
            await watcher.merge({ step }).save();

            // On émet un événement pour mettre à jour la room
            Ws.io.sockets.emit(`updateRoom:${code}`, {
                display: false,
                message: ""
            }
            );

            return response.status(200).json({
                success: true,
            } as apiResponse<Watcher>);
        } catch (error) {
            console.error(error);
            return response.status(500).json({
                success: false,
                error: "Could not add films to bucket",
            } as apiResponse<void>);
        }
    }

    async watcherVoteForFilm({ request, response }) {
        try {
            const { code, films, watcher_id } = request.only([
                "code",
                "films",
                "watcher_id",
            ]) as {
                code: string;
                films: { id: number; note: number }[];
                watcher_id: number;
            };

            const room = await Room.findBy("code", code);

            if (!room) {
                return response.status(404).json({ error: "Room not found" });
            }

            // On vérifie si le watcher est dans la room
            const watcher = await Watcher.find(watcher_id);
            if (!watcher) {
                return response.status(404).json({
                    success: false,
                    error: "Watcher not found",
                } as apiResponse<Watcher>);
            }
            const isWatcherInRoom = await Room.isWatcherIsInRoom(watcher, room);
            if (!isWatcherInRoom) {
                return response.status(400).json({
                    success: false,
                    error: "Watcher is not in the room",
                } as apiResponse<Watcher>);
            }

            //Charger le bucket de la room
            await Database.transaction(async (trx) => {
                for (const { id, note } of films) {
                    // Récupérer le film en lockant la ligne
                    const bucketFilm = await Database.from("buckets_rooms")
                        .where("room_id", room.id)
                        .where("film_id", id)
                        .forUpdate()
                        .useTransaction(trx)
                        .first();

                    if (!bucketFilm) continue;

                    // Incrémenter poids
                    const newWeight = bucketFilm.weight + note;

                    // Mettre à jour en base
                    await Database.from("buckets_rooms")
                        .where("room_id", room.id)
                        .where("film_id", id)
                        .useTransaction(trx)
                        .update({ weight: newWeight });
                }
            });

            // On passe le step du watcher
            await watcher.merge({ step: watcher.step + 1 }).save();

            // On émet un événement pour mettre à jour la room
            Ws.io.sockets.emit(`updateRoom:${code}`, {
                display: false,
                message: "",
            });

            return response.status(200).json({
                success: true,
            } as apiResponse<void>);
        } catch (error) {
            return response.status(500).json({
                success: false,
                error: "Could not vote for film",
            } as apiResponse<void>);
        }
    }
}
