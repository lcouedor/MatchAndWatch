<template>
    <div v-if="ready" class="stepPage">
        <div v-if="room.data.minStep != 2">
            En attente des autres joueurs
        </div>

        <div v-else id="listFilmsToRate" class="listFilmsToRate">
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
                <button class="normalButton" @click="verifyRatings">Voter</button>
            </div>

        </div>
    </div>

</template>

<script>
import * as utils from '@/assets/script/utils';

export default {
    name: 'VoteView',

    data() {
        return {
        }
    },

    props: {
        room: {
            type: Object,
            default: null
        },
        movies: {
            type: Array,
            default: []
        },
        ready: {
            type: Boolean,
            default: false
        },
    },

    watch: {
        ready: {
            immediate: true,
            handler() {
                if (this.ready) {
                    //On affiche tous les id des films
                    // console.log(this.movies.map(film => film.id));
                }
            }
        },
    },

    methods: {

        setNote(filmId, note) {
            //Je retire la classe boxSelected de tous les enfants de la div parent
            let parent = document.getElementById(`cardFilm${filmId}`).getElementsByClassName('ratingBoxes')[0];
            for (let i = 0; i < parent.children.length; i++) {
                parent.children[i].classList.remove('boxSelected');
            }

            //J'ajoute la classe boxSelected à l'élément cliqué
            event.target.classList.add('boxSelected');

            let film = this.movies.find(film => film.id == filmId);

            switch (note) {
                case 'nono':
                    note = -1000;
                    break;
                case 'no':
                    note = -2;
                    break;
                case 'neutral':
                    note = 0;
                    break;
                case 'ok':
                    note = 1;
                    break;
                case 'okok':
                    note = 2;
                    break;
            }
            film.note = note;
        },

        verifyRatings() {
            for (let film of this.movies) {
                if (film.note === undefined) {
                    utils.showSnackbar('Veuillez voter pour tous les films', 2000)
                    return;
                }
            }

            this.$parent.validStep2(this.movies);
        }
    },

};
</script>