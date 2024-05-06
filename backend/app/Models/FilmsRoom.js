'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class FilmsRoom extends Model {
    static get table() {
        return 'films_rooms'
    }

    static get tableColumns() {
        return ['id', 'room_id', 'film_id']
    }

    static get fillable() {
        return ['room_id', 'film_id']
    }

    //Définition de la relation entre les tables
    room() {
        return this.belongsTo('App/Models/Room', 'room_id', 'id')
    }
}

module.exports = FilmsRoom
