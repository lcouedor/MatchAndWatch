<template>
    <div>
    <Confetti v-if="showConfetti" />

    <div v-if="room?.minStep != 2" class="loadingView">
        <div class="stickyBar">
            <StepProgress
                :done="votesDone"
                :total="room?.watchers?.length ?? 0"
                label="ont voté"
                class="headerProgress"
            />
        </div>
        <p class="waitingTitle">En attente des autres participants</p>
        <div class="watchersList">
            <div v-for="watcher in watcherList" :key="watcher.id" class="watcherInWait">
                {{ watcher.name }}
                <template v-if="watcher.step >= 2">&nbsp;✓</template>
            </div>
        </div>
    </div>

    <div v-else class="stepPage">
        <div v-if="winner" class="winnerSection">
            <div class="winnerBg" :style="`background-image: url(https://image.tmdb.org/t/p/w780/${winner.poster_path})`" />
            <div class="winnerContent">
                <div class="winnerBadge">🏆 Film du soir</div>
                <img class="winnerPoster" :src="`https://image.tmdb.org/t/p/w780/${winner.poster_path}`" :alt="winner.title" />
                <h1 class="winnerTitle">{{ winner.title }}</h1>
                <p class="winnerMeta">{{ getYear(winner.release_date) }} &nbsp;·&nbsp; {{ Math.round(winner.vote_average * 10) / 10 }}/10</p>
                <div class="winnerGenres">
                    <span v-for="genre in winner.genres" :key="genre.id" class="genreChip">{{ genre.name }}</span>
                </div>
            </div>
        </div>

        <div class="overviewSection" v-if="winner?.overview">
            <p>{{ winner.overview }}</p>
        </div>

        <div class="rankingSection" v-if="top5.length > 1">
            <h2 class="rankingTitle">Classement</h2>
            <div v-for="(item, index) in top5" :key="item.film.id" class="rankRow" :class="index === 0 ? 'rankFirst' : ''">
                <span class="rankNum">{{ index + 1 }}</span>
                <img class="rankPoster" :src="`https://image.tmdb.org/t/p/w92/${item.film.poster_path}`" :alt="item.film.title" />
                <span class="rankFilmTitle">{{ item.film.title }}</span>
            </div>
        </div>

        <div v-if="!winner" class="noWinner">
            <p>Aucun film sélectionné</p>
        </div>
    </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { Room } from 'shared-types/room';
import { TMDBFilm } from 'shared-types/tmdb';
import { BucketRoom } from 'shared-types/bucketRoom';
import Confetti from '@/components/Confetti.vue';
import StepProgress from '@/components/StepProgress.vue';

const props = defineProps<{
    room: Room | null;
    movies: TMDBFilm[];
}>();

const watcherId = sessionStorage.getItem('watcherId');

const watcherList = computed(() => {
    if (!props.room || !props.room.watchers) return [];
    return props.room.watchers.filter(w => w.id !== Number(watcherId));
});

const votesDone = computed(() =>
    props.room?.watchers?.filter(w => w.step >= 2).length ?? 0
);

const rankedFilms = computed<{ film: TMDBFilm; weight: number }[]>(() => {
    if (!props.movies || props.movies.length === 0 || !props.room?.bucket) return [];
    return props.room.bucket
        .filter((b: BucketRoom) => b.is_active)
        .map((b: BucketRoom) => {
            const film = props.movies.find(m => m.id === b.film_id);
            return film ? { film, weight: b.weight ?? 0 } : null;
        })
        .filter((x): x is { film: TMDBFilm; weight: number } => x !== null)
        .sort((a, b) => b.weight - a.weight);
});

const top5 = computed(() => rankedFilms.value.slice(0, 5));

const winner = computed<TMDBFilm | null>(() => rankedFilms.value[0]?.film ?? null);

function getYear(date?: string): number | null {
    if (!date) return null;
    return new Date(date).getFullYear();
}

const showConfetti = ref(false);
let confettiTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleConfetti(delay: number) {
    if (confettiTimer) return;
    confettiTimer = setTimeout(() => { showConfetti.value = true; }, delay);
}

// minStep === 2 signifie que les résultats sont visibles pour tout le monde
// C'est le seul moment fiable pour déclencher le confetti
const resultsVisible = computed(() => props.room?.minStep === 2);

onMounted(() => {
    // Cas où minStep est déjà 2 au montage (solo très rapide)
    if (resultsVisible.value) scheduleConfetti(1400);
});

watch(resultsVisible, (visible) => {
    if (visible) scheduleConfetti(1000);
});
</script>
