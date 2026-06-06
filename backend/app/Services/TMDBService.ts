import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { TMDBDiscoverResponse, TMDBFilm, TMDBFilmDetails } from 'SharedTypes/tmdb'
import Env from '@ioc:Adonis/Core/Env'
import type { Filters } from 'SharedTypes/filters'

export default class TMDBService {
  private apiKey: string
  private baseURL: string
  private http: AxiosInstance

  constructor() {
    this.apiKey = Env.get('TMDB_API_KEY')
    this.baseURL = Env.get('TMDB_BASE_URL')
    this.http = axios.create({
      baseURL: this.baseURL,
      params: { api_key: this.apiKey },
    })
  }

  private buildDiscoverParams(filters: Filters): Record<string, string | number> {
    const params: Record<string, string | number> = {
      'vote_average.gte': filters.vote_average_min,
      'vote_average.lte': filters.vote_average_max,
      'primary_release_date.gte': `${filters.release_year_min}-01-01`,
      'primary_release_date.lte': `${filters.release_year_max}-12-31`,
      'vote_count.gte': filters.vote_count_min,
    }

    if (filters.vote_count_max !== null) {
      params['vote_count.lte'] = filters.vote_count_max
    }
    if (filters.runtime_min !== null) {
      params['with_runtime.gte'] = filters.runtime_min
    }
    if (filters.runtime_max !== null) {
      params['with_runtime.lte'] = filters.runtime_max
    }
    if (filters.genres.length > 0) {
      // pipe = OR entre les genres (union)
      params['with_genres'] = filters.genres.join('|')
    }

    return params
  }

  public async getNumberOfPages(filters: Filters): Promise<number> {
    try {
      const response: AxiosResponse<TMDBDiscoverResponse> = await this.http.get('/discover/movie', {
        params: this.buildDiscoverParams(filters),
      })
      return response.data.total_pages
    } catch (error) {
      throw new Error('Failed to fetch number of pages from TMDB')
    }
  }

  public async getRandomFilms(numFilms: number, filters: Filters): Promise<TMDBFilm[]> {
    try {
      const discoverParams = this.buildDiscoverParams(filters)
      const maxPages = await this.getNumberOfPages(filters)

      if (maxPages === 0) {
        throw new Error('Aucun film ne correspond aux filtres choisis')
      }

      const randomFilms: TMDBFilm[] = []
      let attempts = 0
      const maxAttempts = numFilms * 10

      while (randomFilms.length < numFilms && attempts < maxAttempts) {
        attempts++
        const randomPage = Math.floor(Math.random() * Math.min(maxPages, 500)) + 1

        const response = await this.http.get('/discover/movie', {
          params: { ...discoverParams, page: randomPage },
        })

        const films: TMDBFilm[] = response.data.results as TMDBFilm[]
        if (films.length === 0) continue

        const randomIndex = Math.floor(Math.random() * films.length)
        const film = films[randomIndex]

        if (!randomFilms.some((m) => m.id === film.id)) {
          randomFilms.push(film)
        }
      }

      if (randomFilms.length < numFilms) {
        throw new Error('Pas assez de films pour ces filtres — essaie d\'élargir les critères')
      }

      return randomFilms
    } catch (error) {
      throw new Error('Failed to fetch random films from TMDB: ' + error)
    }
  }

  public async getFilmDetails(film_id: number): Promise<TMDBFilmDetails> {
    try {
      const response: AxiosResponse<TMDBFilmDetails> = await this.http.get(`/movie/${film_id}`)
      return response.data as TMDBFilmDetails
    } catch (error) {
      throw new Error('Failed to fetch film details from TMDB')
    }
  }
}
