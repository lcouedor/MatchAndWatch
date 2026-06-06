<template>
    <ModalSlug modaleId="modaleCreateRoom" ref="modaleCreateRoom">
        <h1>Créer une Room</h1>

        <div class="inputBloc">
            <label>Format de session</label>
            <select v-model="selectedBucketSize">
                <option v-for="option in bucketSizeOptions" :key="option.value"
                    :value="option.value" :selected="option.default">
                    {{ option.name }} - {{ option.description }}
                </option>
            </select>
        </div>

        <div class="inputBloc">
            <label>Comment t'appelles-tu Padawan ?</label>
            <input v-model="inputNomWatcher" @input="handleInputNom()" maxlength="16" />
            <p class="errorMessage">{{ errorName }}</p>
        </div>

        <!-- Mode filtres (standard / odyssey uniquement) -->
        <div class="inputBloc" v-if="selectedBucketSize > 3">
            <label>Choix des filtres</label>
            <select v-model="filterMode">
                <option value="creator">Je choisis les filtres</option>
                <option value="vote">Tout le monde vote pour les filtres</option>
            </select>
        </div>

        <!-- Timeout par étape -->
        <div class="inputBloc">
            <label>Temps max par étape</label>
            <select v-model="stepTimeoutOption">
                <option value="0">Illimité</option>
                <option value="60">1 min</option>
                <option value="120">2 min</option>
                <option value="180">3 min</option>
                <option value="300">5 min</option>
                <option value="600">10 min</option>
            </select>
            <p class="hint" v-if="estimatedTime">⏱ Durée estimée : {{ estimatedTime }}</p>
        </div>

        <!-- Filtres (mode créateur uniquement) -->
        <div class="filtersSection" v-if="filterMode === 'creator'">
            <p class="sectionTitle">Filtres</p>

            <div class="filterRow">
                <div class="filterLabel">
                    <span>Note</span>
                    <span class="filterValue">{{ filters.vote_average_min }} — {{ filters.vote_average_max }}</span>
                </div>
                <DualRangeSlider
                    :min="0" :max="10" :step="0.5"
                    v-model:minValue="filters.vote_average_min"
                    v-model:maxValue="filters.vote_average_max"
                />
            </div>

            <div class="filterRow">
                <div class="filterLabel">
                    <span>Année de sortie</span>
                    <span class="filterValue">{{ filters.release_year_min }} — {{ filters.release_year_max }}</span>
                </div>
                <DualRangeSlider
                    :min="1950" :max="currentYear" :step="1"
                    v-model:minValue="filters.release_year_min"
                    v-model:maxValue="filters.release_year_max"
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
                    <span class="filterHint">{{ filters.genres.length === 0 ? 'tous' : filters.genres.length + ' sélectionné(s)' }}</span>
                </div>
                <div class="genreGrid">
                    <button
                        v-for="genre in TMDB_GENRES"
                        :key="genre.id"
                        class="genreChip"
                        :class="{ selected: filters.genres.includes(genre.id) }"
                        @click="toggleGenre(genre.id)"
                        type="button"
                    >{{ genre.name }}</button>
                </div>
            </div>
        </div>

        <Spinner v-if="waiting" style="margin-top: 20px;">
            On recherche les meilleurs films pour toi
        </Spinner>

        <div class="buttonsModal">
            <Button @click="createRoom">Créer la Room</Button>
        </div>
    </ModalSlug>
</template>

<script setup lang="ts">
import Button from "@/components/Button.vue";
import DualRangeSlider from "@/components/DualRangeSlider.vue";
import { post } from "../api/services";
import ModalSlug from "./ModalSlug.vue";
import { ref, computed, watch } from "vue";
import Spinner from "@/components/Spinner.vue";
import { useRouter } from 'vue-router'
import { uppercaseChar } from "../utils/utils";
import { Room } from "shared-types/room";
import { Watcher } from "shared-types/watcher";
import { apiResponse } from "shared-types/apiResponse";
import { Filters, TMDB_GENRES, DEFAULT_FILTERS } from "shared-types/filters";
import type { FilterMode } from "shared-types/room";

const router = useRouter()
const currentYear = new Date().getFullYear()

interface BucketSizeOption {
    name: string;
    value: number;
    description: string;
    default: boolean;
}

const bucketSizeOptions: BucketSizeOption[] = [
    { name: "Blitz", value: 3, description: "Pour les pressés", default: false },
    { name: "Standard", value: 5, description: "Pour les indécis", default: true },
    { name: "Odyssey", value: 10, description: "Pour les amoureux du ciné", default: false },
]

const selectedBucketSize = ref<number>(bucketSizeOptions.find(o => o.default)?.value || 5)
const inputNomWatcher = ref<string>("")
const errorName = ref<string>("")
const modaleCreateRoom = ref<InstanceType<typeof ModalSlug> | null>(null)
const waiting = ref<boolean>(false)
const filterMode = ref<FilterMode>('creator')
const stepTimeoutOption = ref<string>("0")
const filters = ref<Filters>({ ...DEFAULT_FILTERS })

const RUNTIME_MAX = 180
const runtimeMinValue = ref(filters.value.runtime_min ?? 0)
const runtimeMaxValue = ref(filters.value.runtime_max ?? RUNTIME_MAX)

watch(runtimeMinValue, (v) => {
    filters.value.runtime_min = v === 0 ? null : v
})
watch(runtimeMaxValue, (v) => {
    filters.value.runtime_max = v >= RUNTIME_MAX ? null : v
})

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
watch(popularityMinIdx, (i) => { filters.value.vote_count_min = POPULARITY_VALUES[i] })
watch(popularityMaxIdx, (i) => { filters.value.vote_count_max = i >= 6 ? null : POPULARITY_VALUES[i] })

watch(selectedBucketSize, (val) => {
    if (val <= 3) filterMode.value = 'creator'
})

const stepTimeout = computed<number | null>(() => {
    const v = parseInt(stepTimeoutOption.value)
    return v > 0 ? v : null
})

const estimatedTime = computed<string | null>(() => {
    if (!stepTimeout.value) return null
    const steps = filterMode.value === 'vote' && selectedBucketSize.value > 3 ? 3 : 2
    const totalSecs = steps * stepTimeout.value
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return secs > 0 ? `${mins}m${secs}s` : `${mins}m`
})

const handleInputNom = () => {
    uppercaseChar(inputNomWatcher)
}

const toggleGenre = (id: number) => {
    const idx = filters.value.genres.indexOf(id)
    if (idx >= 0) filters.value.genres.splice(idx, 1)
    else filters.value.genres.push(id)
}

const createRoom = async () => {
    errorName.value = ""

    if (!inputNomWatcher.value) {
        errorName.value = "Hop là, pas si vite, il me faut ton nom !"
        return
    }

    waiting.value = true

    const room: apiResponse<Room> = await post<Room>("room", {
        bucket_size: selectedBucketSize.value,
        filter_mode: filterMode.value,
        filters: filterMode.value === 'creator' ? filters.value : undefined,
        step_timeout: stepTimeout.value,
    })

    if (!room?.success || !room?.data?.code) {
        waiting.value = false
        errorName.value = room?.error || "Erreur lors de la création de la room"
        return
    }

    const watcher: apiResponse<Watcher> = await post<Watcher>("room/join", {
        code: room.data.code,
        watcher_name: inputNomWatcher.value,
    })

    modaleCreateRoom.value?.dismissModal()
    inputNomWatcher.value = ""
    waiting.value = false

    sessionStorage.setItem("watcherId", (watcher.data?.id)?.toString() ?? "")
    router.push("/match/" + room.data.code)
}

defineExpose({
    showModal() { modaleCreateRoom.value?.showModal() },
    dismissModal() { modaleCreateRoom.value?.dismissModal() },
})
</script>

<style lang="scss" scoped>
@use '../assets/style/variables' as *;

.filtersSection {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 4px;
}

.sectionTitle {
    margin: 0;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: $primaryColor;
    border-bottom: 1px solid rgba(118, 86, 245, 0.3);
    padding-bottom: 8px;
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

.hint {
    font-size: 0.8rem;
    opacity: 0.5;
    margin: 2px 0 0;
}
</style>
