import { Watcher } from './watcher'
import { BucketRoom } from './bucketRoom'
import { Filters } from './filters'

export type FilterMode = 'creator' | 'vote'

export interface Room {
  id: number
  code: string
  bucket_size: number
  filter_mode: FilterMode
  filters: Filters | null
  step_timeout: number | null
  language: string
  createdAt?: string
  updatedAt?: string
  watchers?: Watcher[]
  minStep?: number
  bucket?: BucketRoom[]
}
