import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import type { Filters } from 'SharedTypes/filters'

export default class FilterVote extends BaseModel {
  public static table = 'filter_votes'

  @column({ isPrimary: true })
  public id: number

  @column()
  public room_id: number

  @column()
  public watcher_id: number

  @column({
    prepare: (value: Filters) => JSON.stringify(value),
    consume: (value: string | object) => typeof value === 'string' ? JSON.parse(value) : value,
  })
  public filters: Filters

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
