import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class VoteForFilmValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    code: schema.string({ trim: true }, [
      rules.minLength(4),
      rules.maxLength(4),
    ]),
    watcher_id: schema.number([rules.unsigned()]),
    films: schema.array().members(
      schema.object().members({
        id: schema.number([rules.unsigned()]),
        note: schema.number(),
      })
    ),
  })

  public messages: CustomMessages = {
    'code.required': 'Le code de la room est requis',
    'watcher_id.required': "L'id du watcher est requis",
    'films.required': 'La liste des votes est requise',
  }
}
