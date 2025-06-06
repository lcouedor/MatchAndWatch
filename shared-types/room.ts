import { Watcher } from './watcher';
import { BucketRoom } from './bucketRoom';

export interface Room {
    id: number;
    code: string;
    bucket_size: number;
    createdAt?: string;
    updatedAt?: string;
    watchers?: Watcher[];
    minStep?: number;
    bucket?: BucketRoom[];
}

