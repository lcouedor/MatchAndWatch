import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Cors {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    response.header('Access-Control-Allow-Origin', '*') //TODO gérer dev ou prod pour une URL donnée
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

    // Si c'est une requête préflight OPTIONS, on répond direct 204 (pas de contenu)
    if (request.method() === 'OPTIONS') {
      return response.status(204).send('')
    }

    await next()
  }
}