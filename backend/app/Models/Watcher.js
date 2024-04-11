'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Watcher extends Model {
    //Les propriétés de la classe
    static get table() { //Nom de la table dans la base de données
        return 'watcher'
    }

    static get fillable() {
        return ['name']
    }

    rooms() {
        return this.belongsToMany('App/Models/Room').pivotModel('App/Models/WatcherInRoom')
    }
}

module.exports = Watcher
