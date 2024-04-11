'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PersonInRoomSchema extends Schema {
  up () {
    this.create('watcher_in_rooms', (table) => {
      table.increments()
      table.integer('room_id').references('id').inTable('rooms')
      table.integer('watcher_id').references('id').inTable('watcher')
      table.integer('step').notNullable().defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('watcher_in_rooms')
  }
}

module.exports = PersonInRoomSchema
