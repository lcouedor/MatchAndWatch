'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FilmsRoomSchema extends Schema {
  up () {
    this.create('films_rooms', (table) => {
      table.increments()
      table.integer('room_id').unsigned().references('id').inTable('rooms').onDelete('cascade')
      table.integer('film_id')
      table.timestamps()
    })
  }

  down () {
    this.drop('films_rooms')
  }
}

module.exports = FilmsRoomSchema
