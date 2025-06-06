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
                    <div class="nono" @click="setNote(film.id, 'nono')">✓</div>
                    <div class="no" @click="setNote(film.id, 'no')">✓</div>
                    <div class="neutral" @click="setNote(film.id, 'neutral')">✓</div>
                    <div class="ok" @click="setNote(film.id, 'ok')">✓</div>
                    <div class="okok" @click="setNote(film.id, 'okok')">✓</div>
                </div>
            </div>

            <div class="buttonsContainer">
                <!-- <button class="normalButton" @click="verifyRatings">Voter</button> -->
            </div>

        </div>
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, defineProps, watch, computed } from "vue";

import * as utils from '../utils/utils';
import { Room } from "shared-types/room";
import { TMDBFilm } from "shared-types/tmdb";

const props = defineProps<{
    room: Room | null,
    movies: TMDBFilm[],
    userBucket: TMDBFilm[],
    ready: boolean
}>();

const watcherId: number | null = sessionStorage.getItem('watcherId') !== null ? Number(sessionStorage.getItem('watcherId')) : null;

const watcherList = computed(() => {
    // Return the watchers of the room excluding oneself
    return props.room?.watchers?.filter(watcher => watcher.id !== watcherId) || [];
});

const setNote = (filmId: number, note: string) => {
    // Remove the class boxSelected from all children of the parent div
    const parent = document.getElementById(`cardFilm${filmId}`)?.getElementsByClassName('ratingBoxes')[0];
    if (parent) {
        for (let i = 0; i < parent.children.length; i++) {
            parent.children[i].classList.remove('boxSelected');
        }
    }
    // Add the class boxSelected to the clicked element
    // const target = event.target as HTMLElement;
    // target.classList.add('boxSelected');
    const film = props.movies.find(film => film.id === filmId);
    if (film) {
        // switch (note) {
        //     case 'nono':
        //         film.note = -1000;
        //         break;
        //     case 'no':
        //         film.note = -2;
        //         break;
        //     case 'neutral':
        //         film.note = 0;
        //         break;
        //     case 'ok':
        //         film.note = 1;
        //         break;
        //     case 'okok':
        //         film.note = 2;
        //         break;
        }
    }
// };

    // computed: {
    //     watcherList() {
    //         //on retourne les watchers de la room moins soi-même
    //         return this.room.data.watchers.filter(watcher => watcher.id != this.watcherId);
    //     }
    // },

//     methods: {

//         setNote(filmId, note) {
//             //Je retire la classe boxSelected de tous les enfants de la div parent
//             let parent = document.getElementById(`cardFilm${filmId}`).getElementsByClassName('ratingBoxes')[0];
//             for (let i = 0; i < parent.children.length; i++) {
//                 parent.children[i].classList.remove('boxSelected');
//             }

//             //J'ajoute la classe boxSelected à l'élément cliqué
//             event.target.classList.add('boxSelected');

//             let film = this.movies.find(film => film.id == filmId);

//             switch (note) {
//                 case 'nono':
//                     note = -1000;
//                     break;
//                 case 'no':
//                     note = -2;
//                     break;
//                 case 'neutral':
//                     note = 0;
//                     break;
//                 case 'ok':
//                     note = 1;
//                     break;
//                 case 'okok':
//                     note = 2;
//                     break;
//             }
//             film.note = note;
//         },

//         verifyRatings() {
//             for (let film of this.movies) {
//                 if (film.note === undefined) {
//                     utils.showSnackbar('Veuillez voter pour tous les films', 2000)
//                     return;
//                 }
//             }

//             this.$parent.validStep2(this.movies);
//         }
//     },

// };
</script>