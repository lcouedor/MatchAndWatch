'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Room extends Model {
    //Les propriétés de la classe
    static get table() {
        return 'rooms'
    }

    static get tableColumns() {
        return ['id', 'code', 'room_size', 'bucket_size']
    }

    static get fillable() {
        return ['code', 'room_size', 'bucket_size']
    }

    watchers() {
        return this.belongsToMany('App/Models/Watcher')
            .pivotModel('App/Models/WatcherInRoom')
            .withPivot(['step'])
    }

    static async createCode() {
        // Maximum number of attempts to generate a unique code
        const maxAttempts = 10;
        let attempt = 0;
        let code = '';

        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

        do {
            code = '';

            // Generate a random 4 caracter code
            for (let i = 0; i < 4; i++) {
                code += characters.charAt(Math.floor(Math.random() * characters.length))
            }

            // Check if the code already exists in the database
            const existingRoom = await Room.findBy('code', code);

            if (!existingRoom) {
                // If the code doesn't exist, break out of the loop
                break;
            }

            attempt++;
        } while (attempt < maxAttempts);

        if (attempt === maxAttempts) {
            // Maximum attempts reached without generating a unique code
            throw new Error('Failed to generate a unique room code');
        }

        return code;
    }

    static async isWatcherIsInRoom(watcher, room) {
        return await room.watchers().where('watcher_id', watcher.id).first() !== null
    }
}

module.exports = Room
