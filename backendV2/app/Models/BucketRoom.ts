import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Room from 'App/Models/Room'
import { DateTime } from 'luxon'

export default class BucketRoom extends BaseModel {
  public static table = 'buckets_rooms'

  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'room_id' })
  public room_id: number

  @belongsTo(() => Room, {
    foreignKey: 'room_id',
  })
  public room: BelongsTo<typeof Room>

  @column({ columnName: 'film_id' })
  public film_id: number

  @column()
  public weight: number

  @column()
  public is_active: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}