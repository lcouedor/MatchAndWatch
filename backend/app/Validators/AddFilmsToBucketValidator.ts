import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AddFilmsToBucketValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    code: schema.string({ trim: true }, [
      rules.minLength(4),
      rules.maxLength(4),
    ]),
    watcher_id: schema.number([rules.unsigned()]),
    step: schema.number([rules.unsigned()]),
    filmIds: schema.array().members(schema.number([rules.unsigned()])),
  })

  public messages: CustomMessages = {
    'code.required': 'Le code de la room est requis',
    'watcher_id.required': "L'id du watcher est requis",
    'step.required': "L'étape est requise",
    'filmIds.required': 'La liste des films est requise',
  }
}
