<template>
    <div class="stepPage filterSummary">
        <h2>Filtres appliqués</h2>
        <p class="subtitle">Résultat du vote des préférences</p>

        <div class="filterList" v-if="filters">
            <div class="filterItem">
                <span class="filterKey">Note</span>
                <span class="filterVal">{{ filters.vote_average_min }} — {{ filters.vote_average_max }}</span>
            </div>
            <div class="filterItem">
                <span class="filterKey">Année</span>
                <span class="filterVal">{{ filters.release_year_min }} — {{ filters.release_year_max }}</span>
            </div>
            <div class="filterItem">
                <span class="filterKey">Popularité</span>
                <span class="filterVal">{{ popularityLabel(filters.vote_count_min) }} — {{ popularityLabel(filters.vote_count_max ?? VOTE_COUNT_MAX) }}</span>
            </div>
            <div class="filterItem">
                <span class="filterKey">Durée</span>
                <span class="filterVal">{{ runtimeRangeLabel(filters.runtime_min, filters.runtime_max) }}</span>
            </div>
            <div class="filterItem filterItemGenres">
                <span class="filterKey">Genres</span>
                <div class="genreList">
                    <template v-if="filters.genres.length > 0">
                        <span v-for="id in filters.genres" :key="id" class="genreChip">
                            {{ genreName(id) }}
                        </span>
                    </template>
                    <span v-else class="filterVal">Tous</span>
                </div>
            </div>
        </div>

        <div class="filmStatus">
            <template v-if="!filmsReady">
                <Spinner>Sélection des films en cours…</Spinner>
            </template>
            <button v-else class="normalButton startBtn" @click="emit('continue')">
                Commencer
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import Spinner from '@/components/Spinner.vue'
import { TMDB_GENRES } from 'shared-types/filters'
import type { Room } from 'shared-types/room'
import type { Filters } from 'shared-types/filters'
import { computed } from 'vue'

const props = defineProps<{
    room: Room
    filmsReady: boolean
}>()

const emit = defineEmits<{
    (e: 'continue'): void
}>()

const VOTE_COUNT_MAX = 50000

const filters = computed<Filters | null>(() => props.room.filters ?? null)

const genreName = (id: number): string =>
    TMDB_GENRES.find(g => g.id === id)?.name ?? String(id)

const formatRuntime = (v: number | null): string => {
    if (v === null || v === 0) return '∞'
    const h = Math.floor(v / 60)
    const m = v % 60
    return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`
}
const runtimeRangeLabel = (min: number | null, max: number | null): string => {
    const lo = min ? formatRuntime(min) : '0'
    const hi = formatRuntime(max)
    return `${lo} — ${hi}`
}

const popularityLabel = (n: number): string => {
    if (n >= VOTE_COUNT_MAX) return '∞'
    if (n >= 30000) return 'Blockbuster'
    if (n >= 10000) return 'Populaire'
    if (n >= 3000) return 'Grand public'
    if (n >= 1000) return 'Indépendant'
    if (n > 0) return 'Confidentiel'
    return 'Tous'
}
</script>

<style lang="scss" scoped>
@use '../assets/style/variables' as *;

.filterSummary {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 2vh;
    color: $textColorPrimary;
}

h2 {
    font-size: 1.4rem;
    color: $textColorPrimary;
    margin: 0;
}

.subtitle {
    margin: -12px 0 0;
    font-size: 0.82rem;
    color: rgba(224, 224, 224, 0.45);
}

.filterList {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1.5px solid rgba(118, 86, 245, 0.25);
    border-radius: 16px;
    overflow: hidden;
}

.filterItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(118, 86, 245, 0.12);

    &:last-child {
        border-bottom: none;
    }
}

.filterItemGenres {
    align-items: flex-start;
}

.filterKey {
    font-size: 0.85rem;
    color: rgba(224, 224, 224, 0.5);
    min-width: 90px;
}

.filterVal {
    font-size: 0.9rem;
    color: $primaryColor;
    font-weight: 600;
    text-align: right;
}

.genreList {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
    flex: 1;
}

.genreChip {
    padding: 3px 12px;
    border-radius: $stdRadius;
    border: 1.5px solid $primaryColor;
    background: rgba(118, 86, 245, 0.12);
    color: $textColorPrimary;
    font-size: 0.78rem;
}

.filmStatus {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
}

.startBtn {
    width: 100%;
    margin: 0;
}
</style>
