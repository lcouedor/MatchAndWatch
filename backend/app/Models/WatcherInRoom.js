'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class WatcherInRoom extends Model {
    //Les propriétés de la classe
    static get fillable() {
        return ['room_id', 'watcher_id', 'step']
    }
}

module.exports = WatcherInRoom
