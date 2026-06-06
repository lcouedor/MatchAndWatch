import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SubmitFilterVoteValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    code: schema.string({ trim: true }, [rules.maxLength(4)]),
    watcher_id: schema.number([rules.unsigned()]),
    filters: schema.object().members({
      vote_average_min: schema.number([rules.range(0, 10)]),
      vote_average_max: schema.number([rules.range(0, 10)]),
      release_year_min: schema.number([rules.range(1900, 2100)]),
      release_year_max: schema.number([rules.range(1900, 2100)]),
      vote_count_min: schema.number([rules.unsigned()]),
      vote_count_max: schema.number.nullableAndOptional([rules.unsigned()]),
      runtime_min: schema.number.nullableAndOptional([rules.unsigned()]),
      runtime_max: schema.number.nullableAndOptional([rules.unsigned()]),
      genres: schema.array().members(schema.number()),
    }),
  })

  public messages: CustomMessages = {}
}
