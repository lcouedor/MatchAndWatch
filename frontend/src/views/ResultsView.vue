<template>
    <div v-if="ready" class="stepPage">

        <div v-if="room.data.minStep != 3">
            En attente des autres joueurs
        </div>

        <div v-else class="resultList" v-if="winner">
            <div class="titre">{{ winner.title }} ({{ getYear(winner.release_date) }})</div>
            <p class="titre">{{ }}</p>
            <div class="imgContainer">
                <img :src="`https://image.tmdb.org/t/p/w780/${winner.poster_path}`" alt="Affiche du film">
                <img :src="`https://image.tmdb.org/t/p/w780/${winner.poster_path}`" alt="Affiche du film">
            </div>

            <div class="dataFilm">
                <div class="left">
                    <p>{{ winner.overview }}</p>
                </div>

                <div class="right">
                    <p class="note">{{ Math.round(winner.vote_average * 10) / 10 }}/10 ({{ winner.vote_count }} votants)
                    </p>
                    <p v-for="genre in winner.genres" :key="genre.id">{{ genre.name }}</p>

                </div>
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