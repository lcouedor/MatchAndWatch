import { Room } from './room';

export interface Watcher {
    id: number;
    name: string;
    room_id: number;
    step: number;
    createdAt?: string;
    updatedAt?: string;
    room?: Room;
}