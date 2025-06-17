import { BaseModel, column, hasMany, HasMany } from "@ioc:Adonis/Lucid/Orm";
import Watcher from "App/Models/Watcher";
import BucketRoom from "App/Models/BucketRoom";
import { DateTime } from "luxon";

export default class Room extends BaseModel {
    public static table = "rooms";

    @column({ isPrimary: true })
    public id: number;

    @column()
    public code: string;

    @column()
    public bucket_size: number;

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime;

    @hasMany(() => Watcher, {
        foreignKey: "room_id",
        localKey: "id",
    })
    public watchers: HasMany<typeof Watcher>;

    @hasMany(() => BucketRoom, {
        foreignKey: "room_id",
        localKey: "id",
    })
    public bucket: HasMany<typeof BucketRoom>;



    // Génération d'un code unique pour la room
    public static async createCode(): Promise<string> {
        const maxAttempts: number = 10;
        const characters: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let attempt: number = 0;
        let code: string;
        const triedCodes: Set<string> = new Set();

        do {
            code = "";
            for (let i = 0; i < 4; i++) {
                const randomIndex = Math.floor(
                    Math.random() * characters.length,
                );
                code += characters.charAt(randomIndex);
            }

            if (triedCodes.has(code)) {
                continue; // Si le code a déjà été essayé, on passe à l'itération suivante
            }
            
            const existingRoom = await this.query().where("code", code).first();
            triedCodes.add(code);

            if (!existingRoom) break;
            attempt++;
        } while (attempt < maxAttempts);

        if (attempt === maxAttempts) {
            throw new Error("Failed to generate a unique room code");
        }

        return code;
    }

    public static async isWatcherIsInRoom(
        watcher: Watcher,
        room: Room,
    ): Promise<boolean> {
        //TODO on peut large optimiser non ? en évitant de charger les watchers qui sont déjà dans la room
        const existingWatcher = await room
            .related("watchers")
            .query()
            .where("id", watcher.id)
            .first();
        return existingWatcher !== null;
    }

    public static async minStep(room: Room): Promise<number> {
        // Recharge les watchers si nécessaire
        await room.load("watchers");

        if (room.watchers.length === 0) {
            // Pas de watchers, erreur
            throw new Error("No watcher in the room");
        }

        // Trouve le minimum de step parmi les watchers chargés
        return room.watchers.reduce(
            (min, w) => (w.step < min ? w.step : min),
            room.watchers[0].step,
        );
    }
}
