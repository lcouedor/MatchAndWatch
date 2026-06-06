import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddFiltersToRooms extends BaseSchema {
  protected tableName = 'rooms'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('filter_mode', ['creator', 'vote']).notNullable().defaultTo('creator')
      table.json('filters').nullable()
      table.integer('step_timeout').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('filter_mode')
      table.dropColumn('filters')
      table.dropColumn('step_timeout')
    })
  }
}
