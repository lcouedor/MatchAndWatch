'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PersonSchema extends Schema {
  up () {
    this.create('watcher', (table) => {
      table.increments()
      table.string('name', 80).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('watcher')
  }
}

module.exports = PersonSchema
