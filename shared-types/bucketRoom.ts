export interface BucketRoom {
    id: number;
    room_id: number;
    film_id: number;
    weight?: number;
    is_active?: boolean;
    dislike_count?: number;
    createdAt?: string;
    updatedAt?: string;
}