import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import gameConfig from 'Config/game'

export default class CreateRoomValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    bucket_size: schema.number([
      rules.range(gameConfig.bucketSizeMin, gameConfig.bucketSizeMax),
    ]),
    filter_mode: schema.enum.optional(['creator', 'vote'] as const),
    step_timeout: schema.number.optional([rules.unsigned()]),
    filters: schema.object.optional().members({
      vote_average_min: schema.number.optional([rules.range(0, 10)]),
      vote_average_max: schema.number.optional([rules.range(0, 10)]),
      release_year_min: schema.number.optional([rules.range(1900, 2100)]),
      release_year_max: schema.number.optional([rules.range(1900, 2100)]),
      vote_count_min: schema.number.optional([rules.unsigned()]),
      vote_count_max: schema.number.nullableAndOptional([rules.unsigned()]),
      runtime_min: schema.number.nullableAndOptional([rules.unsigned()]),
      runtime_max: schema.number.nullableAndOptional([rules.unsigned()]),
      genres: schema.array.optional().members(schema.number()),
    }),
  })

  public messages: CustomMessages = {
    'bucket_size.required': 'La taille du bucket est requise',
    'bucket_size.range': `La taille du bucket doit être entre ${gameConfig.bucketSizeMin} et ${gameConfig.bucketSizeMax}`,
  }
}
