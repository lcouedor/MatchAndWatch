'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RoomsSchema extends Schema {
  up () {
    this.table('rooms', (table) => {
      table.increments()
      table.string('code').unique()
      table.integer('room_size')
      table.integer('bucket_size')
      table.timestamps()
    })
  }

  down () {
    this.table('rooms', (table) => {
      // reverse alternations
    })
  }
}

module.exports = RoomsSchema
