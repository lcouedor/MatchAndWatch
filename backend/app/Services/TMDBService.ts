import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { TMDBDiscoverResponse, TMDBFilm, TMDBFilmDetails } from 'SharedTypes/tmdb'
import Env from '@ioc:Adonis/Core/Env'
import type { Filters } from 'SharedTypes/filters'

const SORT_OPTIONS = [
  'popularity.desc',
  'release_date.desc',
  'release_date.asc',
  'vote_average.desc',
]

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

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
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
    const response: AxiosResponse<TMDBDiscoverResponse> = await this.http.get('/discover/movie', {
      params: this.buildDiscoverParams(filters),
    })
    return response.data.total_pages
  }

  public async getRandomFilms(numFilms: number, filters: Filters): Promise<TMDBFilm[]> {
    const discoverParams = {
      ...this.buildDiscoverParams(filters),
      // Tri aléatoire à chaque session pour couvrir différentes parties du catalogue
      sort_by: SORT_OPTIONS[Math.floor(Math.random() * SORT_OPTIONS.length)],
    }

    // Requête initiale : récupérer le nombre total de pages
    const countResponse = await this.http.get<TMDBDiscoverResponse>('/discover/movie', {
      params: discoverParams,
    })
    const maxPages = Math.min(countResponse.data.total_pages, 500)

    if (maxPages === 0) {
      throw new Error('Aucun film ne correspond aux filtres choisis')
    }

    // Mélange de toutes les pages disponibles (Fisher-Yates)
    const pagePool = this.shuffle(Array.from({ length: maxPages }, (_, i) => i + 1))

    // Nombre de pages à fetcher en parallèle : ceil(numFilms / 20) + 1 en buffer
    // Chaque page TMDB retourne 20 films au maximum
    const batchSize = Math.min(Math.ceil(numFilms / 20) + 1, maxPages)
    const batchPages = pagePool.slice(0, batchSize)

    const batchResponses = await Promise.all(
      batchPages.map((page) =>
        this.http.get<TMDBDiscoverResponse>('/discover/movie', {
          params: { ...discoverParams, page },
        })
      )
    )

    // Fusion et mélange de tous les films du batch
    const batchFilms = this.shuffle(batchResponses.flatMap((r) => r.data.results))

    const seenIds = new Set<number>()
    const selectedFilms: TMDBFilm[] = []

    for (const film of batchFilms) {
      if (!seenIds.has(film.id) && selectedFilms.length < numFilms) {
        seenIds.add(film.id)
        selectedFilms.push(film)
      }
    }

    // Fallback séquentiel si le batch initial n'a pas suffi
    for (let i = batchSize; i < pagePool.length && selectedFilms.length < numFilms; i++) {
      const response = await this.http.get<TMDBDiscoverResponse>('/discover/movie', {
        params: { ...discoverParams, page: pagePool[i] },
      })
      for (const film of this.shuffle(response.data.results as TMDBFilm[])) {
        if (!seenIds.has(film.id) && selectedFilms.length < numFilms) {
          seenIds.add(film.id)
          selectedFilms.push(film)
        }
      }
    }

    if (selectedFilms.length < numFilms) {
      throw new Error("Pas assez de films pour ces filtres — essaie d'élargir les critères")
    }

    return selectedFilms
  }

  public async getFilmDetails(film_id: number, language = 'fr-FR'): Promise<TMDBFilmDetails> {
    try {
      const response: AxiosResponse<TMDBFilmDetails> = await this.http.get(`/movie/${film_id}`, {
        params: { language },
      })
      return response.data as TMDBFilmDetails
    } catch (error) {
      throw new Error('Failed to fetch film details from TMDB')
    }
  }
}
