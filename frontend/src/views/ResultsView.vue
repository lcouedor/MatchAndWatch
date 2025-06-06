<template>
    <div v-if="room.data.minStep != 3" class="loadingView">
        <p>En attente des autres participants</p>
        <div class="watchersList">
            <div v-for="watcher in watcherList" :key="watcher.id" class="watcherInWait"
                :class="watcher.step == 2 ? 'waitingWatcher' : ''">
                {{ watcher.name }}
                <div class="waiting waitingVisible">
                    <div class="spin"></div>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="stepPage">

        <div class="resultList" v-if="winner">
            <div class="titre">{{ winner.title }} ({{ getYear(winner.release_date) }})</div>
            <p class="titre">{{ }}</p>
            <div class="imgContainer">
                <img :src="`https://image.tmdb.org/t/p/w780/${winner.poster_path}`" alt="Affiche du film">
                <img :src="`https://image.tmdb.org/t/p/w780/${winner.poster_path}`" alt="Affiche du film">
            </div>

            <div class="dataFilm">
                <p class="note">{{ Math.round(winner.vote_average * 10) / 10 }}/10 ({{ winner.vote_count }} votants imdb)</p>
                <div class="genresList">
                    <p v-for="genre in winner.genres" :key="genre.id">{{ genre.name }}</p>
                </div>

                <div class="overviewZone">{{ winner.overview }}</div>
            </div>

        </div>

    </div>

</template>

<script>

export default {
    name: 'ResultsView',

    data() {
        return {
            films: [],
            winner: null,
            watcherId: sessionStorage.getItem('watcherId'),
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
        updated: {
            type: Boolean,
            default: false
        }
    },

    watch: {
        updated: {
            immediate: true,
            async handler() {
                if (this.room.data.minStep == 3) {
                    //calcul du gagnant
                    this.winner = this.calcWinner();
                }
            }
        },
    },

    computed: {
        watcherList() {
            //on retourne les watchers de la room moins soi-même
            return this.room.data.watchers.filter(watcher => watcher.id != this.watcherId);
        }
    },

    methods: {

        calcWinner() {
            // Je détermine le gagnant en fonction du weight de chaque film
            // Si il y a égalité, je prends le plus voté
            let winner = this.movies[0];
            for (let i = 1; i < this.movies.length; i++) {
                if (this.movies[i].weight > winner.weight) {
                    winner = this.movies[i];
                } else if (this.movies[i].weight == winner.weight) {
                    if (this.movies[i].vote_count > winner.vote_count) {
                        winner = this.movies[i];
                    }
                }
            }
            return winner;
        },

        getYear(date) {
            return new Date(date).getFullYear();
        },
    }



};
</script>