export interface Filters {
  vote_average_min: number
  vote_average_max: number
  release_year_min: number
  release_year_max: number
  vote_count_min: number
  vote_count_max: number | null
  runtime_min: number | null
  runtime_max: number | null
  genres: number[]
}

export const TMDB_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Aventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comédie' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentaire' },
  { id: 18, name: 'Drame' },
  { id: 10751, name: 'Famille' },
  { id: 14, name: 'Fantastique' },
  { id: 36, name: 'Histoire' },
  { id: 27, name: 'Horreur' },
  { id: 10402, name: 'Musique' },
  { id: 9648, name: 'Mystère' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science-Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerre' },
  { id: 37, name: 'Western' },
]

export const DEFAULT_FILTERS: Filters = {
  vote_average_min: 6,
  vote_average_max: 10,
  release_year_min: 2000,
  release_year_max: new Date().getFullYear(),
  vote_count_min: 500,
  vote_count_max: null,
  runtime_min: null,
  runtime_max: null,
  genres: [],
}
