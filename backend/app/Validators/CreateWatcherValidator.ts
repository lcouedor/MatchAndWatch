import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateWatcherValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }, [
      rules.minLength(1),
      rules.maxLength(50),
    ]),
    room_id: schema.number([rules.unsigned()]),
  })

  public messages: CustomMessages = {
    'name.required': 'Le nom est requis',
    'room_id.required': "L'id de la room est requis",
  }
}
