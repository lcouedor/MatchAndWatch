import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Watchers extends BaseSchema {
  protected tableName = 'watchers'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.integer('room_id').unsigned().references('id').inTable('rooms').onDelete('CASCADE')
      table.integer('step').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}