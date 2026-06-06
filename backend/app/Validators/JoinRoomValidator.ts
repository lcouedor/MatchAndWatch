import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class JoinRoomValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    code: schema.string({ trim: true }, [
      rules.minLength(4),
      rules.maxLength(4),
    ]),
    watcher_name: schema.string({ trim: true }, [
      rules.minLength(1),
      rules.maxLength(50),
    ]),
  })

  public messages: CustomMessages = {
    'code.required': 'Le code de la room est requis',
    'code.minLength': 'Le code doit faire 4 caractères',
    'code.maxLength': 'Le code doit faire 4 caractères',
    'watcher_name.required': 'Le nom est requis',
    'watcher_name.maxLength': 'Le nom ne peut pas dépasser 50 caractères',
  }
}
