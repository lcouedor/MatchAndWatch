<template>
    <div v-if="room?.minStep != 2" class="loadingView">
        <p>En attente des autres participants</p>
        <div class="watchersList">
            <div v-for="watcher in watcherList" :key="watcher.id" class="watcherInWait"
                :class="watcher.step == 2 ? 'waitingWatcher' : ''">
                {{ watcher.name }}
                <div class="waiting waitingVisible">
                    <div class="spin"></div>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="stepPage">
        <div class="resultList" v-if="getWinner">
            <div class="titre">{{ getWinner.title }} ({{ getYear(getWinner.release_date) }})</div>
            <div class="imgContainer">
                <img :src="`https://image.tmdb.org/t/p/w780/${getWinner.poster_path}`" alt="Affiche du film">
                <img :src="`https://image.tmdb.org/t/p/w780/${getWinner.poster_path}`" alt="Affiche du film">
            </div>

            <div class="dataFilm">
                <p class="note">{{ Math.round(getWinner.vote_average * 10) / 10 }}/10 ({{ getWinner.vote_count }}
                    votants imdb)</p>
                <div class="genresList">
                    <p v-for="genre in getWinner.genres" :key="genre.id">{{ genre.name }}</p>
                </div>

                <div class="overviewZone">{{ getWinner.overview }}</div>
            </div>

        </div>

    </div>

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Room } from '../../../shared-types/room';
import { Watcher } from '../../../shared-types/watcher';
import { apiResponse } from 'shared-types/apiResponse';
import { TMDBFilm } from '../../../shared-types/tmdb';
import { BucketRoom } from 'shared-types/bucketRoom';

const props = defineProps<{
    room: Room | null;
    movies: TMDBFilm[];
}>();

// Données réactives
const films = ref<TMDBFilm[]>([]);
const winner = ref<TMDBFilm | null>(null);
const watcherId = sessionStorage.getItem('watcherId');


// Computed
const watcherList = computed(() => {
    if (!props.room || !props.room.watchers) return [];
    return props.room.watchers.filter(watcher => watcher.id !== Number(watcherId));
});

const getWinner = computed<TMDBFilm | null>(() => {
    if (!props.movies || props.movies.length === 0 || !props.room?.bucket) return null;

    const bestBucket: BucketRoom | null = props.room.bucket.reduce((best: BucketRoom | null, current: BucketRoom) => {
        if (!best || (current.weight ?? 0) > (best.weight ?? 0)) {
            return current;
        }
        return best;
    }, null);

    if (!bestBucket) return null;

    return props.movies.find(movie => movie.id === bestBucket.film_id) || null;
});

function getYear(date?: string): number | null {
    if (!date) return null;
    return new Date(date).getFullYear();
}
</script>