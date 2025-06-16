<template>
    <div v-if="room?.minStep != 1" class="loadingView">
        <p>En attente des autres participants</p>
        <div class="watchersList">
            <div v-for="watcher in watcherList" :key="watcher.id" class="watcherInWait"
                :class="watcher.step == 1 ? 'waitingWatcher' : ''">
                {{ watcher.name }}
                <div class="waiting waitingVisible">
                    <div class="spin"></div>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="stepPage">
        <div id="listFilmsToRate" class="listFilmsToRate">
            <div v-for="film in movies" :id="`cardFilm${film.id}`" class="cardFilmContainer">
                <div class="titre">{{ film.title }}</div>
                <div class="cardImg">
                    <img :src="`https://image.tmdb.org/t/p/w780/${film.poster_path}`" alt="Affiche du film">
                    <img :src="`https://image.tmdb.org/t/p/w780/${film.poster_path}`" alt="Affiche du film"
                        class="blurImg">
                    <div class="overviewCardZone">
                        {{ film.overview }}
                    </div>
                </div>
                <div class="ratingBoxes">
                    <div v-for="note in [-1000, -1, 0, 1, 2]" :key="note"
                        :class="[{ boxSelected: selectedNotes.get(film.id) === note }]"
                        @click="selectedNotes.set(film.id, note)">
                    </div>
                </div>
            </div>
            <div class="buttonsContainer">
                <button class="normalButton" @click="verifyRatings">Voter</button>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref, defineProps, computed } from "vue";

import { Room } from "shared-types/room";
import { TMDBFilm } from "shared-types/tmdb";

const props = defineProps<{
    room: Room | null,
    movies: TMDBFilm[],
}>();

const emit = defineEmits<{
    (event: 'validStep2', selectedNotes: Map<number, number>): void;
}>();

// On crée un Map réactif pour stocker les notes sélectionnées
const selectedNotes = ref(new Map<number, number>(
    props.movies.map(film => [film.id, 0] as [number, number]
    )));

const watcherId: number | null = sessionStorage.getItem('watcherId') !== null ? Number(sessionStorage.getItem('watcherId')) : null;

const watcherList = computed(() => {
    return props.room?.watchers?.filter(watcher => watcher.id !== watcherId) || [];
});

const verifyRatings = () => {
    emit('validStep2', selectedNotes.value);
};
</script>