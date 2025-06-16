import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Room from 'App/Models/Room'
import { DateTime } from 'luxon'

export default class Watcher extends BaseModel {
  public static table = 'watchers'

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public room_id: number

  @column()
  public step: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Room, {
    foreignKey: 'room_id',
  })
  public room: BelongsTo<typeof Room>
}
