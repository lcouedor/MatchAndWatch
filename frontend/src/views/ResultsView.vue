<template>
    <div v-if="ready">

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
    },

    watch: {
        ready: {
            immediate: true,
            async handler() {
                if (this.ready) {
                    // Je détermine le gagnant
                    // Si il y a égalité, je prends le plus voté
                    this.winner = this.movies.reduce((acc, film) => {
                        if (!acc) {
                            return film;
                        }

                        if (film.weight > acc.weight) {
                            return film;
                        }

                        if (film.weight === acc.weight) {
                            if (film.vote_count > acc.vote_count) {
                                return film;
                            }
                        }

                        return acc;
                    }, null);

                }
            }
        },
    },

    methods: {

        getYear(date) {
            return new Date(date).getFullYear();
        },
    }



};
</script>