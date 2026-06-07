<template>
    <div v-if="!ready" class="loadingView">
        <div class="loadingData">
            <p>{{ $t('swipe.loading') }}</p>
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
                :label="$t('swipe.finished')"
                class="headerProgress"
            />
            <div class="countdown" v-if="timeLeft !== null">⏱ {{ timeLeftLabel }}</div>
        </div>

        <div class="bandeauSwipe">
            {{ $t('swipe.liked', { done: userBucket.length, total: room?.bucket_size ?? 0 }) }}
        </div>

        <div class="titre" v-if="currentFilm">
            <p>{{ currentFilm.title }} ({{ new Date(currentFilm.release_date).getFullYear() }})</p>
        </div>

        <div class="containerFilms">
            <!-- Carte suivante, légèrement en retrait -->
            <div v-if="nextFilm" class="backCard" ref="backCardEl">
                <img :src="`https://image.tmdb.org/t/p/w780/${nextFilm.poster_path}`" />
            </div>

            <!-- Carte courante, interactive -->
            <div v-if="currentFilm" class="swipeCard" ref="card"
                @touchstart="onDragStart" @touchend="onDragEnd">
                <img :src="`https://image.tmdb.org/t/p/w780/${currentFilm.poster_path}`" />
                <div id="leftZone" ref="actualLeft">
                    <div class="background"></div>
                    <span>{{ $t('swipe.noWatch') }}</span>
                </div>
                <div id="rightZone" ref="actualRight">
                    <div class="background"></div>
                    <span>{{ $t('swipe.watch') }}</span>
                </div>
            </div>
        </div>

        <div class="overviewZone" v-if="currentFilm">
            {{ currentFilm.overview }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from "vue";
import StepProgress from "@/components/StepProgress.vue";
import { Room } from 'shared-types/room';
import { TMDBFilm } from 'shared-types/tmdb';

const films = ref<TMDBFilm[]>([]);
const displayFilms = ref<TMDBFilm[]>([]);
const currentFilm = ref<TMDBFilm | null>(null);
const initialX = ref(0);
const card = ref<HTMLElement | null>(null);
const backCardEl = ref<HTMLElement | null>(null);
const actualLeft = ref<HTMLElement | null>(null);
const actualRight = ref<HTMLElement | null>(null);

const props = defineProps<{
    room: Room | null,
    movies: TMDBFilm[],
    userBucket: TMDBFilm[],
    ready: boolean
}>();

const emit = defineEmits<{
    (event: 'validStep1', seenFilmIds: number[]): void;
}>();

const seenFilmIds = new Set<number>();

watch(currentFilm, (film) => {
    if (film) seenFilmIds.add(film.id);
});

const emitDone = () => emit('validStep1', [...seenFilmIds]);

const nextFilm = computed(() => displayFilms.value[displayFilms.value.length - 1] ?? null)

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
                    emitDone()
                }
            }, 1000)
        }
    }
}, { immediate: true })

// Listener non-passif pour que preventDefault bloque le scroll natif pendant le swipe
watch(card, (newCard, oldCard) => {
    if (oldCard) oldCard.removeEventListener('touchmove', onDragMove as EventListener)
    if (newCard) newCard.addEventListener('touchmove', onDragMove as EventListener, { passive: false })
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
    if (card.value) card.value.removeEventListener('touchmove', onDragMove as EventListener)
})

watch([() => props.ready, () => props.movies], ([newReady, newMovies]) => {
    const movies = newMovies as TMDBFilm[];
    if (newReady && movies.length > 0 && films.value.length === 0) {
        films.value = movies;
        displayFilms.value = [...movies].sort(() => 0.5 - Math.random());
        currentFilm.value = displayFilms.value.pop() || null;
    }
}, { immediate: true });

// ─── Back card helpers ──────────────────────────────────────
const BACK_SCALE = 0.94
const BACK_TY = 10 // px

const setBackProgress = (p: number) => {
    if (!backCardEl.value) return
    const scale = BACK_SCALE + (1 - BACK_SCALE) * p
    const ty = BACK_TY * (1 - p)
    backCardEl.value.style.transform = `translateX(-50%) translateY(${ty}px) scale(${scale})`
}

// ─── Card animation ─────────────────────────────────────────
const getCardCenter = () => {
    const rect = card.value!.getBoundingClientRect()
    return rect.left + rect.width / 2
}

const resetCard = () => {
    if (!card.value) return
    card.value.style.transform = 'translateX(-50%)'
    card.value.style.transition = 'none'
    if (actualLeft.value) actualLeft.value.style.opacity = '0'
    if (actualRight.value) actualRight.value.style.opacity = '0'
}

const animateCard = (dir: 'left' | 'right', callback: () => void) => {
    const duration = 280
    const tx = dir === 'left'
        ? 'translateX(calc(-50% - 110vw))'
        : 'translateX(calc(-50% + 110vw))'
    const rot = dir === 'left' ? 'rotate(-22deg)' : 'rotate(22deg)'

    // Promote back card in sync with exit
    if (backCardEl.value) {
        backCardEl.value.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
        setBackProgress(1)
    }

    card.value!.style.transform = `${tx} ${rot}`
    card.value!.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`

    setTimeout(() => {
        callback()
        resetCard()
        // Reset back card position while it's hidden under the new front card
        nextTick(() => {
            if (backCardEl.value) {
                backCardEl.value.style.transition = 'none'
                setBackProgress(0)
            }
        })
    }, duration)
}

// ─── Touch handlers ─────────────────────────────────────────
const onDragStart = (e: TouchEvent) => {
    initialX.value = e.touches[0].clientX
    resetCard()
}

const onDragMove = (e: TouchEvent) => {
    if (!card.value) return
    e.preventDefault()

    const diff = e.touches[0].clientX - initialX.value
    const quarter = window.innerWidth / 4

    const setZoneOpacity = (zone: HTMLElement, amount: number) => {
        (zone.querySelector('.background') as HTMLElement).style.opacity = amount.toString()
        zone.style.opacity = '1'
    }

    if (diff < -quarter) {
        let rotation = ((diff + quarter) / quarter) * 25
        if (rotation < -25) rotation = -25
        card.value.style.transform = `translateX(calc(-50% + ${diff}px)) rotate(${rotation}deg)`
        setZoneOpacity(actualLeft.value!, Math.min(Math.abs(diff + quarter) / quarter * 0.5, 0.5))
        actualRight.value!.style.opacity = '0'
    } else if (diff > quarter) {
        let rotation = ((diff - quarter) / quarter) * 25
        if (rotation > 25) rotation = 25
        card.value.style.transform = `translateX(calc(-50% + ${diff}px)) rotate(${rotation}deg)`
        setZoneOpacity(actualRight.value!, Math.min((diff - quarter) / quarter * 0.5, 0.5))
        actualLeft.value!.style.opacity = '0'
    } else {
        card.value.style.transform = `translateX(calc(-50% + ${diff}px))`
        actualLeft.value!.style.opacity = '0'
        actualRight.value!.style.opacity = '0'
    }

    // Scale up back card progressively
    const progress = Math.min(Math.abs(diff) / (window.innerWidth / 2), 1)
    if (backCardEl.value) {
        backCardEl.value.style.transition = 'none'
        setBackProgress(progress)
    }
}

const onDragEnd = () => {
    if (!card.value) return

    const center = getCardCenter()
    const quarter = window.innerWidth / 4
    const bucketSize = props.room?.bucket_size ?? Infinity

    if (center < quarter) {
        animateCard('left', () => {
            currentFilm.value = displayFilms.value.pop() || null
            if (!currentFilm.value) emitDone()
        })
    } else if (center > 3 * quarter) {
        animateCard('right', () => {
            if (currentFilm.value) props.userBucket.push(currentFilm.value)
            currentFilm.value = displayFilms.value.pop() || null
            if (props.userBucket.length >= bucketSize || !currentFilm.value) emitDone()
        })
    } else {
        // Snap back
        card.value.style.transform = 'translateX(-50%)'
        card.value.style.transition = 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        setTimeout(() => { if (card.value) card.value.style.transition = 'none' }, 400)
        actualLeft.value!.style.opacity = '0'
        actualRight.value!.style.opacity = '0'
        if (backCardEl.value) {
            backCardEl.value.style.transition = 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            setBackProgress(0)
        }
    }
}
</script>
