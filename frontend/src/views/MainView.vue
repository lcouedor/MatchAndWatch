<template>
    <div class="bodyApp">
        <div class="headerMain">
            <div class="copyZone normalButton" @click="showQr = true">
                {{ roomCode }}
            </div>

            <button class="leftRoom normalButton" @click="leftRoom">Exit</button>

            <span
            class="info infoPulse"
            :key="`info-${userStep}-${isFilterVoteStep}`"
            @click="showInfoModal"
            v-if="isFilterVoteStep || userStep in [0,1]"
        >i</span>
        </div>

        <QrCodeOverlay :show="showQr" :roomCode="roomCode" @close="showQr = false" />

        <Transition name="scene" mode="out-in">
            <!-- Étape vote des filtres -->
            <FilterVotingStep
                v-if="isFilterVoteStep && room && watcherId"
                key="filter-vote"
                :room="room"
                :watcherId="watcherId"
                :externalVotesCount="filterVoteCount"
                @filtersLocked="onFiltersLocked"
            />

            <!-- Résumé des filtres -->
            <FilterSummaryScreen
                v-else-if="isFilterSummaryStep && room"
                key="filter-summary"
                :room="room"
                :filmsReady="moviesList.length > 0"
                @continue="filterSummaryDismissed = true"
            />

            <!-- Swipe -->
            <SwipeView
                v-else-if="userStep === 0"
                key="swipe"
                :room="room" :ready="ready" :movies="moviesList" :userBucket="userBucket"
                @validStep1="validStep1"
            />

            <!-- Vote -->
            <VoteView
                v-else-if="userStep === 1"
                key="vote"
                :room="room" :movies="moviesList"
                @validStep2="validStep2"
            />

            <!-- Résultats -->
            <ResultsView
                v-else
                key="results"
                :room="room" :movies="moviesList" :allMovies="fullMoviesList"
            />
        </Transition>

        <ModaleInfo ref="modaleInfo" :page="isFilterVoteStep ? -2 : userStep" :step-timeout="room?.step_timeout ?? null" />
    </div>
</template>

<script setup lang="ts">
import { io } from "socket.io-client";
import { get, del, post } from '../api/services';

import SwipeView from '@/views/SwipeView.vue';
import VoteView from '@/views/VoteView.vue';
import ResultsView from '@/views/ResultsView.vue';
import ModaleInfo from '@/modales/ModaleInfo.vue'
import FilterVotingStep from '@/components/FilterVotingStep.vue'
import FilterSummaryScreen from '@/components/FilterSummaryScreen.vue'
import QrCodeOverlay from '@/components/QrCodeOverlay.vue'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, onUnmounted, ref, computed } from "vue";
import { triggerSnackbar, hideSnackbar } from '../utils/utils';

import { Room } from 'shared-types/room';
import { Watcher } from 'shared-types/watcher';
import { apiResponse } from 'shared-types/apiResponse';
import { TMDBFilm } from 'shared-types/tmdb';

const socket = io(process.env.VUE_APP_API_URL || "");

const modaleInfo = ref<InstanceType<typeof ModaleInfo> | null>(null);

const route: any = useRoute();
const router = useRouter();
const roomCode: string = route.params.roomCode as string;

const room = ref<Room | null>(null);
const moviesList = ref<TMDBFilm[]>([]);
const fullMoviesList = ref<TMDBFilm[]>([]);
const userBucket = ref<TMDBFilm[]>([]);
const swipeSeenIds = ref<number[]>([]);
const ready = ref<boolean>(false);
const userStep = ref<number>(0);
const leftRoomClick = ref<number>(0);
const watcherId = ref<number | null>(null);
const filterVoteCount = ref<number>(0);
const filterSummaryDismissed = ref<boolean>(false);
const showQr = ref<boolean>(false);
let snackbarId: number | null = null;

// Vrai si on est en mode vote de filtres et que les filtres ne sont pas encore définis
const isFilterVoteStep = computed(() =>
    room.value?.filter_mode === 'vote' && room.value?.filters === null
)

// Vrai juste après que les filtres ont été verrouillés : affiche le résumé avant le swipe
const isFilterSummaryStep = computed(() =>
    room.value?.filter_mode === 'vote' &&
    room.value?.filters !== null &&
    userStep.value === 0 &&
    !filterSummaryDismissed.value
)


onMounted(async () => {
    await updateRoom();

    if (!isFilterVoteStep.value) {
        moviesList.value = await getFilms();
    }

    socket.on(`updateRoom:${roomCode}`, async (message: {display: boolean, message: string, filterVoteCount?: number}) => {
        if (message.display) {
            triggerSnackbar(message.message, 3000);
        }
        if (message.filterVoteCount !== undefined) {
            filterVoteCount.value = message.filterVoteCount;
        }
        await updateRoom();

        if (!isFilterVoteStep.value && moviesList.value.length === 0) {
            moviesList.value = await getFilms();
        }
    });

    ready.value = true;
});

const onFiltersLocked = async () => {
    await updateRoom();
    moviesList.value = await getFilms();
};

const showInfoModal = () => {
    modaleInfo.value?.$el.classList.add('showModal');
};

const leftRoom = async () => {
    if (leftRoomClick.value == 0) {
        leftRoomClick.value++;
        snackbarId = triggerSnackbar('Appuyez à nouveau pour quitter', 20000)
        setTimeout(() => { leftRoomClick.value = 0; }, 20000);
    } else {
        hideSnackbar(snackbarId || 0);
        await del('room/leave', {
            code: roomCode,
            watcher_id: sessionStorage.getItem('watcherId'),
        });
        sessionStorage.removeItem('watcherId');
        router.push({ name: 'home' });
    }
};

onUnmounted(() => {
    socket.off(`updateRoom:${roomCode}`);
});

const updateRoom = async () => {
    room.value = await getRoom();

    const id = parseInt(sessionStorage.getItem('watcherId') || '');
    if (
        !id ||
        !room.value?.watchers ||
        !room.value.watchers.find((w: Watcher) => w.id == id)
    ) {
        router.push({ name: 'home', query: { code: roomCode } });
        return;
    }

    watcherId.value = id;
    const foundWatcher = room.value.watchers.find((w: Watcher) => w.id == id);
    userStep.value = foundWatcher ? foundWatcher.step : 0;

    if ((room.value.minStep ?? 0) >= 1 && room.value.bucket) {
        moviesList.value = moviesList.value.filter(film =>
            room.value?.bucket?.some(b => b.film_id === film.id && b.is_active) ?? false
        );
    }
};

const getRoom = async (): Promise<Room> => {
    const roomData: apiResponse<Room> = await get<Room>(`room/${roomCode}`, {});
    if (roomData.success === false) {
        router.push({ name: 'home' });
        return {} as Room;
    }
    return roomData.data as Room;
};

const getFilms = async (): Promise<TMDBFilm[]> => {
    if (!room.value?.bucket) return [];
    const films = await Promise.all(room.value.bucket.map(async (film) => {
        const response: apiResponse<TMDBFilm> = await get<TMDBFilm>(`movie`, { movieId: film.film_id });
        return response.data as TMDBFilm;
    }));
    fullMoviesList.value = films;
    return films;
};

const validStep1 = async (seenIds: number[] = []) => {
    swipeSeenIds.value = seenIds;
    const likedIds = new Set(userBucket.value.map(f => f.id));
    const dislikedIds = seenIds.filter(id => !likedIds.has(id));
    const response: apiResponse<any> = await post('room/addFilmBucket', {
        code: roomCode,
        watcher_id: sessionStorage.getItem('watcherId'),
        step: 1,
        filmIds: userBucket.value.map(film => film.id),
        dislikedFilmIds: dislikedIds,
    });
    if (response.success) {
        userStep.value = 1;
        await updateRoom();
    } else {
        alert('Erreur lors de l\'ajout des films au bucket');
    }
};

const validStep2 = async (selectedNotes: Map<number, number>) => {
    const response: apiResponse<any> = await post('room/voteForFilm', {
        code: roomCode,
        watcher_id: sessionStorage.getItem('watcherId'),
        films: Array.from(selectedNotes.entries()).map(([id, note]) => ({ id, note })),
    });
    if (response.success) {
        userStep.value = 2;
        await updateRoom();
    } else {
        alert('Erreur lors du vote pour les films');
    }
};
</script>

<style>
/* Transition standard entre scènes */
.scene-enter-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}
.scene-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.scene-enter-from {
    opacity: 0;
    transform: translateY(12px);
}
.scene-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

/* Transition spéciale vers les résultats */
.scene-results-enter-active {
    transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scene-results-leave-active {
    transition: opacity 0.2s ease;
}
.scene-results-enter-from {
    opacity: 0;
    transform: scale(0.92) translateY(20px);
}
.scene-results-leave-to {
    opacity: 0;
}
</style>
