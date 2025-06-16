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
                    <!-- TODO mettre le chemin dans un fichier de conf -->
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

import { ref, defineProps, watch } from "vue";

import { Room } from '../../../shared-types/room';
import { TMDBFilm } from '../../../shared-types/tmdb';


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

watch(() => props.ready, (newReady) => {
    if (newReady) {
        // Une fois que les films sont chargés, on les copie dans films
        films.value = props.movies;
        displayFilms.value = [...films.value];
        // On shuffle les films à afficher
        displayFilms.value = displayFilms.value.sort(() => 0.5 - Math.random());
        currentFilm.value = displayFilms.value.pop() || null;
    }
});
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
    //TODO mettre dans un fichier de conf
    const duration: number = 200; // Duration of the animation in ms
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
        // Swipe vers la gauche au-delà du quart gauche
        let rotation = ((diff + quarter) / quarter) * 30;
        if (rotation < -30) rotation = -30;
        card.value.style.transform = `translateX(calc(-50% + ${diff}px)) rotate(${rotation}deg)`;
        setOpacity(actualLeft.value!, Math.min(Math.abs(diff + quarter) / quarter * 0.5, 0.5));
        actualRight.value!.style.opacity = '0';
    } else if (diff > quarter) {
        // Swipe vers la droite au-delà du 3/4 droite (ici simplifié à quarter à droite)
        let rotation = ((diff - quarter) / quarter) * 30;
        if (rotation > 30) rotation = 30;
        card.value.style.transform = `translateX(calc(-50% + ${diff}px)) rotate(${rotation}deg)`;
        setOpacity(actualRight.value!, Math.min((diff - quarter) / quarter * 0.5, 0.5));
        actualLeft.value!.style.opacity = '0';
    } else {
        // Zone morte au centre, pas de rotation ni opacité
        card.value.style.transform = `translateX(calc(-50% + ${diff}px))`;
        actualLeft.value!.style.opacity = '0';
        actualRight.value!.style.opacity = '0';
    }
};

const onDragEnd = () => {
    if (!card.value) return;

    const center = getCardCenter();
    const quarter = window.innerWidth / 4;

    if (center < quarter) {
        animateCard('left', () => {
            currentFilm.value = displayFilms.value.pop() || null;
        });
    } else if (center > 3 * quarter) {
        animateCard('right', () => {
            if (currentFilm.value) props.userBucket.push(currentFilm.value);
            currentFilm.value = displayFilms.value.pop() || null;
        });
    } else {
        card.value!.style.left = '50%';
        card.value!.style.transform = 'translateX(-50%)';
        card.value!.style.transition = `all 500ms, transform 500ms`;
        setTimeout(() => (card.value!.style.transition = 'none'), 500);
    }
    if (props.userBucket.length === props.room?.bucket_size || displayFilms.value.length === 0) {
        emit('validStep1');
    }
};
</script>