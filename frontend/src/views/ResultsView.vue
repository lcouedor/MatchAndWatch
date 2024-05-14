<template>
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
                <p class="note">{{ Math.round(winner.vote_average * 10) / 10 }}/10 ({{ winner.vote_count }} votants)</p>
                <p v-for="genre in winner.genres" :key="genre.id">{{ genre.name }}</p>
                
            </div>




        </div>

    </div>

</template>

<script>
import { getMovie } from '@/api/services';

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
        ready: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        computedfilms() {
            let results = this.films.sort((a, b) => {
                return b.note - a.note;
            });

            return results;
        }
    },

    watch: {
        ready: {
            immediate: true,
            async handler() {
                if (this.ready) {
                    await this.getFilms();

                    //J'ajoute les notes des joueurs aux films
                    this.films.forEach(film => {
                        film.note = this.getNoteFilm(film.id);
                    });
                }
            }
        },
        room: {
            immediate: true,
            async handler() {
                await this.getFilms();

                //J'ajoute les notes des joueurs aux films
                this.films.forEach(film => {
                    film.note = this.getNoteFilm(film.id);
                });

                //Je détermine le gagnant
                //Si il y a égalité, je prends le plus voté
                this.winner = this.films.reduce((acc, film) => {
                    if (!acc) {
                        return film;
                    }

                    if (film.note > acc.note) {
                        return film;
                    }

                    if (film.note === acc.note) {
                        if (film.vote_count > acc.vote_count) {
                            return film;
                        }
                    }

                    return acc;
                }, null);
            }
        },

        winner: {
            immediate: true,
            handler() {
                if (!this.winner) return;
                this.$nextTick(() => {
                    //On regarde tous les .genre pour voir leur contenu et leur donner une couleur
                    let genres = document.querySelectorAll('.genre');
                    genres.forEach(genre => {
                        let genreName = genre.innerHTML;
                        let color = this.getColor(genreName);
                        genre.style.backgroundColor = color;
                    });
                });

            }
        }
    },

    methods: {
        async getFilms() {
            this.films = await Promise.all(this.room.data.bucket.map(async film => {
                return await getMovie(film.idFilm);
            }));
        },

        getNoteFilm(id) {
            let elem = this.room.data.bucket.find(elem => elem.idFilm == id);
            return elem.weight;
        },

        getYear(date) {
            return new Date(date).getFullYear();
        },
    }



};
</script>