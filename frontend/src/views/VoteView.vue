<template>
    <div>
    <!-- Attente que tous les watchers aient swipé -->
    <div v-if="room?.minStep != 1" class="loadingView">
        <div class="stickyBar">
            <StepProgress
                :done="swipesDone"
                :total="room?.watchers?.length ?? 0"
                :label="$t('vote.swipeDone')"
            />
        </div>
        <p class="waitingTitle">{{ $t('vote.waiting') }}</p>
        <div class="watchersList">
            <div v-for="watcher in otherWatchers" :key="watcher.id" class="watcherInWait">
                {{ watcher.name }}
                <template v-if="watcher.step >= 1">&nbsp;✓</template>
            </div>
        </div>
    </div>

    <!-- Étape de vote -->
    <div v-else class="stepPage">
        <div class="stickyBar">
            <StepProgress
                :done="votesDone"
                :total="room?.watchers?.length ?? 0"
                :label="$t('vote.voted')"
                class="headerProgress"
            />
            <div class="countdown" v-if="timeLeft !== null">⏱ {{ timeLeftLabel }}</div>
        </div>

        <div id="listFilmsToRate" class="listFilmsToRate">
            <div v-for="film in movies" :id="`cardFilm${film.id}`" class="cardFilmContainer">
                <div class="filmTitle">{{ film.title }}</div>
                <div class="coverWrapper" @click="synopsisFilm = film">
                    <img :src="`https://image.tmdb.org/t/p/w780/${film.poster_path}`" alt="Affiche du film" class="coverImg">
                    <div class="synopsisHint">Synopsis ↑</div>
                </div>
                <div class="ratingRow">
                    <button
                        v-for="(opt, i) in ratingOptions"
                        :key="opt.value"
                        class="ratingBtn"
                        :class="[`tier${i}`, { selected: selectedNotes.get(film.id) === opt.value }]"
                        @click.stop="selectedNotes.set(film.id, opt.value)"
                    >
                        <span class="ratingEmoji">{{ opt.emoji }}</span>
                        <span class="ratingLabel">{{ opt.label }}</span>
                    </button>
                </div>
            </div>
            <div class="buttonsContainer">
                <button class="normalButton" @click="verifyRatings">{{ $t('vote.voteBtn') }}</button>
            </div>
        </div>

        <!-- Synopsis bottom sheet -->
        <Teleport to="body">
            <Transition name="synopsis-sheet">
                <div v-if="synopsisFilm" class="synopsisOverlay" @click="synopsisFilm = null">
                    <div class="synopsisSheet" @click.stop>
                        <div class="sheetHandle"></div>
                        <div class="sheetHeader">
                            <span class="sheetTitle">{{ synopsisFilm.title }}</span>
                            <button class="sheetClose" @click="synopsisFilm = null">✕</button>
                        </div>
                        <p class="sheetBody">{{ synopsisFilm.overview }}</p>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import { useI18n } from 'vue-i18n'
import StepProgress from "@/components/StepProgress.vue";
import { Room } from "shared-types/room";
import { TMDBFilm } from "shared-types/tmdb";

const { t } = useI18n()

const props = defineProps<{
    room: Room | null,
    movies: TMDBFilm[],
}>();

const emit = defineEmits<{
    (event: 'validStep2', selectedNotes: Map<number, number>): void;
}>();

const selectedNotes = ref(new Map<number, number>(
    props.movies.map(film => [film.id, 0] as [number, number])
));

const synopsisFilm = ref<TMDBFilm | null>(null)

const ratingOptions = computed(() => [
    { value: -1000, emoji: '❌', label: t('vote.never') },
    { value: -1,    emoji: '👎', label: t('vote.meh') },
    { value: 0,     emoji: '·',  label: t('vote.neutral') },
    { value: 1,     emoji: '👍', label: t('vote.yes') },
    { value: 2,     emoji: '❤️', label: t('vote.top') },
])

const watcherId: number | null = sessionStorage.getItem('watcherId') !== null
    ? Number(sessionStorage.getItem('watcherId'))
    : null;

const otherWatchers = computed(() =>
    props.room?.watchers?.filter(w => w.id !== watcherId) || []
)

const swipesDone = computed(() =>
    props.room?.watchers?.filter(w => w.step >= 1).length ?? 0
)

const votesDone = computed(() =>
    props.room?.watchers?.filter(w => w.step >= 2).length ?? 0
)

const timeLeft = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | null = null
let timerStarted = false
let voteSubmitted = false

const timeLeftLabel = computed(() => {
    if (timeLeft.value === null) return ''
    const m = Math.floor(timeLeft.value / 60)
    const s = timeLeft.value % 60
    return m > 0 ? `${m}m${s.toString().padStart(2, '0')}s` : `${s}s`
})

watch(() => props.room, (room) => {
    const minStep = room?.minStep ?? 0
    const timeout = room?.step_timeout
    if (minStep >= 1 && timeout != null && !timerStarted) {
        timerStarted = true
        timeLeft.value = timeout
        if (timeout > 0) {
            timer = setInterval(() => {
                timeLeft.value = (timeLeft.value ?? 0) - 1
                if ((timeLeft.value ?? 0) <= 0) {
                    clearInterval(timer!)
                    verifyRatings()
                }
            }, 1000)
        }
    }
}, { immediate: true })

onUnmounted(() => {
    if (timer) clearInterval(timer)
})

const verifyRatings = () => {
    if (voteSubmitted) return
    voteSubmitted = true
    emit('validStep2', selectedNotes.value);
};
</script>

<style lang="scss" scoped>
@use '../assets/style/variables' as *;

.stickyBar {
    position: sticky;
    top: 0;
    z-index: 5;
    background: $backgroundColor;
    padding: 1vh 2vh;
    display: flex;
    align-items: center;
    gap: 12px;
}

.headerProgress {
    flex: 1;
    min-width: 0;
    padding: 0;
}

.countdown {
    flex-shrink: 0;
    padding: 4px 12px;
    border-radius: $stdRadius;
    border: 1.5px solid rgba(255, 138, 22, 0.4);
    background: rgba(255, 138, 22, 0.08);
    color: $accentColor;
    font-size: 0.82rem;
    font-weight: 600;
    white-space: nowrap;
}

.waitingTitle {
    padding: 2vh;
    font-size: 1rem;
    color: rgba(224, 224, 224, 0.6);
    text-align: center;
}
</style>
