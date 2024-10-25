'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class BucketRoom extends Model {
    static get table() {
        return 'bucket_rooms'
    }

    static get tableColumns() {
        return ['id', 'idRoom', 'idWatcher', 'idFilm', 'weight']
    }

    static get fillable() {
        return ['room_id', 'movie_id', 'watcher_id', 'weight']
    }

    //Définition de la relation entre les tables
    room() {
        return this.belongsTo('App/Models/Room')
    }

    watcher() {
        return this.belongsTo('App/Models/Watcher')
    }
}

module.exports = BucketRoom
