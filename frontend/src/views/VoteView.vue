<template>
    <div v-if="room.data.minStep !=2">
        En attente des autres joueurs
    </div>

    <div v-else class="listFilmsToRate">
        <div v-for="film in films" :id="`cardFilm${film.id}`">
            {{ film.title }}
            <img :src="`https://image.tmdb.org/t/p/w780/${film.poster_path}`" alt="Affiche du film">
            <div class="ratingBoxes">
                <div class="nono" @click="setNote(film.id,'nono')"></div>
                <div class="no" @click="setNote(film.id,'no')"></div>
                <div class="neutral" @click="setNote(film.id,'neutral')"></div>
                <div class="ok" @click="setNote(film.id,'ok')"></div>
                <div class="okok" @click="setNote(film.id,'okok')"></div>
            </div>
        </div>

        <button @click="verifyRatings">Valider</button>
    </div>
    
</template>

<script>
import { getMovie } from '@/api/services';

export default {
    name: 'VoteView',

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

    watch: {
        ready: {
            immediate: true,
            handler() {
                if (this.ready) {
                    this.getFilms();
                }
            }
        },
        room: {
            immediate: true,
            handler() {
                this.getFilms();
            }
        }
    },

    methods: {
        async getFilms() {
            this.films = await Promise.all(this.room.data.bucket.map(async film => {
                return await getMovie(film.idFilm);
            }));
        },

        setNote(filmId, note) {
            //Je retire la classe boxSelected de tous les enfants de la div parent
            let parent = document.getElementById(`cardFilm${filmId}`).getElementsByClassName('ratingBoxes')[0];
            for (let i = 0; i < parent.children.length; i++) {
                parent.children[i].classList.remove('boxSelected');
            }

            //J'ajoute la classe boxSelected à l'élément cliqué
            event.target.classList.add('boxSelected');

            let film = this.films.find(film => film.id == filmId);

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

        verifyRatings(){
            //TODO vérifier que tous les films ont une note
            for(let film of this.films){
                if(film.note === undefined){
                    alert('Veuillez noter tous les films');
                    return;
                }
            }

            this.$parent.validStep2(this.films);
        }
    },

};
</script>