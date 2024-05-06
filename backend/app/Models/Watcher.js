'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Watcher extends Model {
    static get table() {
        return 'watcher';
    }

    static get tableColumns() {
        return ['id', 'name', 'created_at', 'updated_at', 'idRoom', 'step'];
    }

    static get fillable() {
        return ['name', 'idRoom', 'step'];
    }

    room() {
        return this.belongsTo('App/Models/Room', 'idRoom', 'id')
    }
}

module.exports = Watcher