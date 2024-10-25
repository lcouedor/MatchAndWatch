'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BucketRoomSchema extends Schema {
  up () {
    this.create('bucket_rooms', (table) => {
      table.increments()
      table.integer('idRoom').references('id').inTable('rooms').notNullable()
      table.integer('idWatcher').references('id').inTable('watcher').notNullable()
      table.integer('idFilm').notNullable()
      table.integer('weight').defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('bucket_rooms')
  }
}

module.exports = BucketRoomSchema
