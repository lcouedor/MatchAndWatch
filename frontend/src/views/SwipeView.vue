<template>
    <div v-if="!ready" class="loadingView">
        <div class="loadingData">
            <p>On y est presque !</p>
            <div class="waiting waitingVisible">
                <div class="spin"></div>
            </div>
        </div>
    </div>

    <div v-else class="stepPage">
        <div class="stickyBar">
            <StepProgress
                :done="swipesDone"
                :total="room?.watchers?.length ?? 0"
                label="ont terminé"
                class="headerProgress"
            />
            <div class="countdown" v-if="timeLeft !== null">⏱ {{ timeLeftLabel }}</div>
        </div>

        <div class="bandeauSwipe">
            {{ userBucket.length }}/{{ room?.bucket_size }} films likés
        </div>

        <div class="titre" v-if="currentFilm">
            <p>{{ currentFilm.title }} ({{ new Date(currentFilm.release_date).getFullYear() }})</p>
        </div>

        <div class="containerFilms">
            <div v-for="film in displayFilms" class="backgroundCard">
                <img :src="`https://image.tmdb.org/t/p/w780/${film.poster_path}`" alt="Affiche du film">
            </div>

            <div v-if="currentFilm" class="swipeCard">
                <div class="parentImage">
                    <img :src="`https://image.tmdb.org/t/p/w780/${currentFilm.poster_path}`" alt="Affiche du film"
                        @touchstart="onDragStart" @touchmove="onDragMove" @touchend="onDragEnd" ref="card">
                    <div id="leftZone" ref="actualLeft">
                        <div class="background"></div>
                        <span>No Watch</span>
                    </div>
                    <div id="rightZone" ref="actualRight">
                        <div class="background"></div>
                        <span>Watch</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="overviewZone" v-if="currentFilm">
            {{ currentFilm.overview }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from "vue";
import StepProgress from "@/components/StepProgress.vue";
import { Room } from 'shared-types/room';
import { TMDBFilm } from 'shared-types/tmdb';

const films = ref<TMDBFilm[]>([]);
const displayFilms = ref<TMDBFilm[]>([]);
const currentFilm = ref<TMDBFilm | null>(null);
const initialX = ref(0);
const initialLeft = ref(0);
const card = ref<HTMLElement | null>(null);
const actualLeft = ref<HTMLElement | null>(null);
const actualRight = ref<HTMLElement | null>(null);

const props = defineProps<{
    room: Room | null,
    movies: TMDBFilm[],
    userBucket: TMDBFilm[],
    ready: boolean
}>();

const emit = defineEmits<{
    (event: 'validStep1'): void;
}>();

const swipesDone = computed(() =>
    props.room?.watchers?.filter(w => w.step >= 1).length ?? 0
)

const timeLeft = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | null = null
let timerStarted = false

const timeLeftLabel = computed(() => {
    if (timeLeft.value === null) return ''
    const m = Math.floor(timeLeft.value / 60)
    const s = timeLeft.value % 60
    return m > 0 ? `${m}m${s.toString().padStart(2, '0')}s` : `${s}s`
})

watch([() => props.room?.step_timeout, () => films.value.length], ([timeout, filmCount]) => {
    if (timeout != null && (filmCount as number) > 0 && !timerStarted) {
        timerStarted = true
        timeLeft.value = timeout as number
        if ((timeout as number) > 0) {
            timer = setInterval(() => {
                timeLeft.value = (timeLeft.value ?? 0) - 1
                if ((timeLeft.value ?? 0) <= 0) {
                    clearInterval(timer!)
                    emit('validStep1')
                }
            }, 1000)
        }
    }
}, { immediate: true })

onUnmounted(() => {
    if (timer) clearInterval(timer)
})

// Surveille ready ET movies : gère le cas où SwipeView monte avec ready=true
// mais les films arrivent après (ex: après l'étape de vote des filtres)
watch([() => props.ready, () => props.movies], ([newReady, newMovies]) => {
    const movies = newMovies as TMDBFilm[];
    if (newReady && movies.length > 0 && films.value.length === 0) {
        films.value = movies;
        displayFilms.value = [...movies].sort(() => 0.5 - Math.random());
        currentFilm.value = displayFilms.value.pop() || null;
    }
}, { immediate: true });

const getCardCenter = () =>
    card.value!.getBoundingClientRect().left + card.value!.offsetWidth / 2;

const resetCard = () => {
    if (!card.value) return;
    card.value!.style.left = '50%';
    card.value!.style.transform = 'translateX(-50%)';
    card.value!.style.transition = 'none';
    actualLeft.value!.style.opacity = '0';
    actualRight.value!.style.opacity = '0';
};

const animateCard = (dir: 'left' | 'right', callback: () => void) => {
    const duration: number = 200;
    card.value!.style.left = dir === 'left' ? '-100%' : '100%';
    card.value!.style.transition = `all ${duration}ms, transform ${duration}ms`;

    setTimeout(() => {
        callback();
        resetCard();
    }, duration);
};

const onDragStart = (e: TouchEvent) => {
    initialX.value = e.touches[0].clientX;
    initialLeft.value = card.value?.getBoundingClientRect().left ?? 0;
    resetCard();
};

const onDragMove = (e: TouchEvent) => {
    const setOpacity = (zone: HTMLElement, amount: number) => {
        (zone.querySelector('.background') as HTMLElement).style.opacity = amount.toString();
        zone.style.opacity = '1';
    };

    if (!card.value) return;

    const diff = e.touches[0].clientX - initialX.value;
    const quarter = window.innerWidth / 4;

    if (diff < -quarter) {
        let rotation = ((diff + quarter) / quarter) * 30;
        if (rotation < -30) rotation = -30;
        card.value.style.transform = `translateX(calc(-50% + ${diff}px)) rotate(${rotation}deg)`;
        setOpacity(actualLeft.value!, Math.min(Math.abs(diff + quarter) / quarter * 0.5, 0.5));
        actualRight.value!.style.opacity = '0';
    } else if (diff > quarter) {
        let rotation = ((diff - quarter) / quarter) * 30;
        if (rotation > 30) rotation = 30;
        card.value.style.transform = `translateX(calc(-50% + ${diff}px)) rotate(${rotation}deg)`;
        setOpacity(actualRight.value!, Math.min((diff - quarter) / quarter * 0.5, 0.5));
        actualLeft.value!.style.opacity = '0';
    } else {
        card.value.style.transform = `translateX(calc(-50% + ${diff}px))`;
        actualLeft.value!.style.opacity = '0';
        actualRight.value!.style.opacity = '0';
    }
};

const onDragEnd = () => {
    if (!card.value) return;

    const center = getCardCenter();
    const quarter = window.innerWidth / 4;

    const bucketSize = props.room?.bucket_size ?? Infinity;

    if (center < quarter) {
        animateCard('left', () => {
            currentFilm.value = displayFilms.value.pop() || null;
            if (!currentFilm.value) {
                emit('validStep1');
            }
        });
    } else if (center > 3 * quarter) {
        animateCard('right', () => {
            if (currentFilm.value) props.userBucket.push(currentFilm.value);
            currentFilm.value = displayFilms.value.pop() || null;
            if (props.userBucket.length >= bucketSize || !currentFilm.value) {
                emit('validStep1');
            }
        });
    } else {
        card.value!.style.left = '50%';
        card.value!.style.transform = 'translateX(-50%)';
        card.value!.style.transition = `all 500ms, transform 500ms`;
        setTimeout(() => (card.value!.style.transition = 'none'), 500);
    }
};
</script>
