<template>
    <div v-if="room.data.minStep !=3">
        En attente des autres joueurs
    </div>

    <div v-else class="resultList">
        <div v-for="film in computedfilms">
            {{ film.title }} : {{ film.note }} points
            <img :src="`https://image.tmdb.org/t/p/w780/${film.poster_path}`" alt="Affiche du film">
        </div>
    </div>
    
</template>

<script>
import { getMovie } from '@/api/services';

export default {
    name: 'ResultsView',

    data() {
        return {
            films: []
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
            }
        }
    },

    methods: {
        async getFilms() {
            this.films = await Promise.all(this.room.data.bucket.map(async film => {
                return await getMovie(film.idFilm);
            }));
        },

        getNoteFilm(id){
            let elem = this.room.data.bucket.find(elem => elem.idFilm == id);
            return elem.weight;
        }
    }



};
</script>