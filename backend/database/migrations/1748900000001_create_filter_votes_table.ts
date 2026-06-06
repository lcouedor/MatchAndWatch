import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateFilterVotesTable extends BaseSchema {
  protected tableName = 'filter_votes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('room_id').unsigned().references('id').inTable('rooms').onDelete('CASCADE')
      table.integer('watcher_id').unsigned().references('id').inTable('watchers').onDelete('CASCADE')
      table.json('filters').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      table.unique(['room_id', 'watcher_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
