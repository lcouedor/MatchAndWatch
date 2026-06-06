import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddDislikeCountToBucketsRooms extends BaseSchema {
  protected tableName = 'buckets_rooms'

  public async up () {
    this.schema.table(this.tableName, (table) => {
      table.integer('dislike_count').defaultTo(0).notNullable()
    })
  }

  public async down () {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('dislike_count')
    })
  }
}
