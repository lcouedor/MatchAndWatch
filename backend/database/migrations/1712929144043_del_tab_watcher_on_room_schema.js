'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DelTabWatcherOnRoomSchema extends Schema {
  up () {
    this.drop('watcher_in_room')
    this.table('watcher', (table) => {
      table.integer('idRoom').references('id').inTable('rooms').notNullable()
      table.integer('step').defaultTo(1)
    })
  }

  down () {
    this.table('watcher', (table) => {
      table.dropColumn('idRoom')
    })
    this.create('watcher_in_room', (table) => {})
  }
}

module.exports = DelTabWatcherOnRoomSchema
