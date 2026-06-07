<template>
    <div class="stepPage filterVoting">
        <!-- Header: progress + timer -->
        <div class="voteHeader">
            <StepProgress
                :done="votesCount"
                :total="totalWatchers"
                label="ont voté"
                class="headerProgress"
            />
            <div class="countdown" v-if="timeLeft !== null">
                ⏱ {{ timeLeftLabel }}
            </div>
        </div>

        <!-- Vote form -->
        <div v-if="!hasVoted" class="filterForm">
            <h2>Vos préférences</h2>
            <p class="subtitle">La médiane sera appliquée pour les valeurs, l'union pour les genres</p>

            <div class="filterRow">
                <div class="filterLabel">
                    <span>Note</span>
                    <span class="filterValue">{{ localFilters.vote_average_min }} — {{ localFilters.vote_average_max }}</span>
                </div>
                <DualRangeSlider
                    :min="0" :max="10" :step="0.5"
                    v-model:minValue="localFilters.vote_average_min"
                    v-model:maxValue="localFilters.vote_average_max"
                />
            </div>

            <div class="filterRow">
                <div class="filterLabel">
                    <span>Année de sortie</span>
                    <span class="filterValue">{{ localFilters.release_year_min }} — {{ localFilters.release_year_max }}</span>
                </div>
                <DualRangeSlider
                    :min="1950" :max="currentYear" :step="1"
                    v-model:minValue="localFilters.release_year_min"
                    v-model:maxValue="localFilters.release_year_max"
                />
            </div>

            <div class="filterRow">
                <div class="filterLabel">
                    <span>Popularité</span>
                    <span class="filterValue">{{ POPULARITY_LABELS[popularityMinIdx] }} — {{ POPULARITY_LABELS[popularityMaxIdx] }}</span>
                </div>
                <DualRangeSlider
                    :min="0" :max="6" :step="1"
                    v-model:minValue="popularityMinIdx"
                    v-model:maxValue="popularityMaxIdx"
                />
            </div>

            <div class="filterRow">
                <div class="filterLabel">
                    <span>Durée</span>
                    <span class="filterValue">{{ runtimeLabel }}</span>
                </div>
                <DualRangeSlider
                    :min="0" :max="RUNTIME_MAX" :step="5"
                    v-model:minValue="runtimeMinValue"
                    v-model:maxValue="runtimeMaxValue"
                />
            </div>

            <div class="filterRow">
                <div class="filterLabel">
                    <span>Genres</span>
                    <span class="filterHint">{{ localFilters.genres.length === 0 ? 'tous' : localFilters.genres.length + ' sél.' }}</span>
                </div>
                <div class="genreGrid">
                    <button
                        v-for="genre in TMDB_GENRES"
                        :key="genre.id"
                        class="genreChip"
                        :class="{ selected: localFilters.genres.includes(genre.id) }"
                        @click="toggleGenre(genre.id)"
                        type="button"
                    >{{ genre.name }}</button>
                </div>
            </div>

            <button class="voteBtn" @click="submitVote" :disabled="submitting">
                {{ submitting ? 'Envoi...' : 'Valider mes préférences' }}
            </button>
        </div>

        <!-- Waiting state -->
        <div v-else class="waitingScreen">
            <p class="waitingTitle">En attente des autres participants</p>
            <div class="watchersList">
                <div v-for="watcher in otherWatchers" :key="watcher.id" class="watcherInWait">
                    {{ watcher.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { post } from '@/api/services'
import DualRangeSlider from '@/components/DualRangeSlider.vue'
import StepProgress from '@/components/StepProgress.vue'
import { Filters, TMDB_GENRES, DEFAULT_FILTERS } from 'shared-types/filters'
import type { Room } from 'shared-types/room'

const props = defineProps<{
    room: Room
    watcherId: number
    externalVotesCount?: number
}>()

const emit = defineEmits<{
    (e: 'filtersLocked'): void
}>()

const currentYear = new Date().getFullYear()
const localFilters = ref<Filters>({ ...DEFAULT_FILTERS })
const RUNTIME_MAX = 180
const runtimeMinValue = ref(localFilters.value.runtime_min ?? 0)
const runtimeMaxValue = ref(localFilters.value.runtime_max ?? RUNTIME_MAX)
watch(runtimeMinValue, (v) => {
    localFilters.value.runtime_min = v === 0 ? null : v
})
watch(runtimeMaxValue, (v) => {
    localFilters.value.runtime_max = v >= RUNTIME_MAX ? null : v
})
watch(() => props.externalVotesCount, (count) => {
    if (count !== undefined) votesCount.value = count
}, { immediate: true })

const formatRuntime = (v: number): string => {
    if (v === 0) return '0'
    const h = Math.floor(v / 60)
    const m = v % 60
    return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`
}
const runtimeLabel = computed(() => {
    const lo = formatRuntime(runtimeMinValue.value)
    const hi = runtimeMaxValue.value >= RUNTIME_MAX ? '∞' : formatRuntime(runtimeMaxValue.value)
    return `${lo} — ${hi}`
})

const POPULARITY_VALUES = [0, 500, 1000, 3000, 10000, 30000, 50000]
const POPULARITY_LABELS = ['Tous', 'Confidentiel', 'Indépendant', 'Grand public', 'Populaire', 'Blockbuster', '∞']
const popularityMinIdx = ref(0)
const popularityMaxIdx = ref(6)
watch(popularityMinIdx, (i) => { localFilters.value.vote_count_min = POPULARITY_VALUES[i] })
watch(popularityMaxIdx, (i) => { localFilters.value.vote_count_max = i >= 6 ? null : POPULARITY_VALUES[i] })

const hasVoted = ref(false)
const submitting = ref(false)
const votesCount = ref(0)
const timeLeft = ref<number | null>(props.room.step_timeout ?? null)
let timer: ReturnType<typeof setInterval> | null = null

const totalWatchers = computed(() => props.room.watchers?.length ?? 1)
const otherWatchers = computed(() => props.room.watchers?.filter(w => w.id !== props.watcherId) ?? [])

const timeLeftLabel = computed(() => {
    if (timeLeft.value === null) return ''
    const m = Math.floor(timeLeft.value / 60)
    const s = timeLeft.value % 60
    return m > 0 ? `${m}m${s.toString().padStart(2, '0')}s` : `${s}s`
})

onMounted(() => {
    if (timeLeft.value !== null && timeLeft.value > 0) {
        timer = setInterval(() => {
            if (timeLeft.value === null) return
            timeLeft.value--
            if (timeLeft.value <= 0) {
                clearInterval(timer!)
                if (!hasVoted.value) submitVote()
            }
        }, 1000)
    }
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
})

const toggleGenre = (id: number) => {
    const idx = localFilters.value.genres.indexOf(id)
    if (idx >= 0) localFilters.value.genres.splice(idx, 1)
    else localFilters.value.genres.push(id)
}

const submitVote = async () => {
    if (submitting.value) return
    submitting.value = true

    const filtersToSend: Filters = {
        ...localFilters.value,
    }

    const res = await post('room/filterVote', {
        code: props.room.code,
        watcher_id: props.watcherId,
        filters: filtersToSend,
    })

    submitting.value = false

    if (!res.success) return

    hasVoted.value = true
    votesCount.value = Math.max(votesCount.value + 1, 1)

    if (res.data?.filtersLocked) {
        emit('filtersLocked')
    }
}
</script>

<style lang="scss" scoped>
@use '../assets/style/variables' as *;

.filterVoting {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 2vh;
}

.voteHeader {
    position: sticky;
    top: 0;
    z-index: 5;
    background: $backgroundColor;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
    padding: 1vh 0;
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

.filterForm {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    box-sizing: border-box;
}

h2 {
    margin: 0;
    font-size: 1.3rem;
    color: $textColorPrimary;
}

.subtitle {
    margin: -12px 0 0;
    font-size: 0.8rem;
    color: rgba(224, 224, 224, 0.45);
}

.filterRow {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
}

.filterLabel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: $textColorPrimary;
}

.filterValue {
    color: $primaryColor;
    font-weight: 600;
    font-size: 0.9rem;
}

.filterUnit {
    font-size: 0.75rem;
    font-weight: 400;
    color: rgba(118, 86, 245, 0.7);
    margin-left: 2px;
}

.filterHint {
    color: rgba(224, 224, 224, 0.45);
    font-size: 0.8rem;
}

.genreGrid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
}

.genreChip {
    padding: 5px 14px;
    border-radius: $stdRadius;
    border: 1.5px solid rgba(118, 86, 245, 0.3);
    background: transparent;
    color: rgba(224, 224, 224, 0.65);
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.18s;

    &.selected {
        border-color: $primaryColor;
        background: rgba(118, 86, 245, 0.2);
        color: $textColorPrimary;
    }
}

.voteBtn {
    width: 100%;
    padding: 14px;
    border-radius: $stdRadius;
    border: none;
    background: $primaryColor;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.waitingScreen {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    box-sizing: border-box;
}

.waitingTitle {
    padding: 0 2vh;
    font-size: 1rem;
    color: rgba(224, 224, 224, 0.6);
    text-align: center;
    margin: 0;
}
</style>
