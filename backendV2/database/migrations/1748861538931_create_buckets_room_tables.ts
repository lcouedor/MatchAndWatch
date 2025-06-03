import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class BucketsRooms extends BaseSchema {
  protected tableName = 'buckets_rooms'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('room_id').unsigned().references('id').inTable('rooms').onDelete('CASCADE')
      table.integer('film_id').notNullable()
      table.integer('weight').defaultTo(0).notNullable()
      table.boolean('is_active').defaultTo(true).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}