<template>
    <div class="bodyApp">
        <div class="headerMain">
            <div class="copyZone normalButton">
                {{ $route.params.roomCode }}
                <div class="symbols" @click="copyToClipboard">
                    <span class="copySymbol symbolVisible">
                        <img src="../assets/images/copy.png" alt="">
                    </span>
                    <span class="validCopySymbol">
                        <img src="../assets/images/check.png" alt="">
                    </span>
                </div>
            </div>

            <button class="leftRoom normalButton" @click="leftRoom">Exit</button>

            <span class="info" @click="displayInfo" v-if="userStep == 1 || userStep == 2">i</span>

            


        </div>

        <SwipeView :room="room" :ready="ready" :movies="movies" v-if="userStep == 1" />
        <VoteView :room="room" :ready="ready" :movies="moviesBucketRoom" v-if="userStep == 2" />
        <ResultsView :room="room" :ready="ready" :movies="moviesBucketRoom" :updated="updated" v-if="userStep == 3" />

        <ModaleInfoMain :page="userStep" />

    </div>

</template>

<script>
import { io } from "socket.io-client";
import { get, apiURL, post, getMovie, del } from '@/api/services';
import * as utils from '@/assets/script/utils';

import SwipeView from '@/views/SwipeView.vue';
import VoteView from '@/views/VoteView.vue';
import ResultsView from '@/views/ResultsView.vue';
import CustomBtn from '@/components/Button.vue';
import ModaleInfoMain from '@/modales/ModaleInfoMain.vue';

const socket = io(apiURL);

export default {
    name: 'MainVue',

    data() {
        return {
            room: null,
            ready: false,
            userStep: 0,

            userBucket: [],

            movies: [], //La liste de tous les films de la room, chargés une fois pour améliorer les performances
            moviesBucketRoom: [], //La liste des films du bucket de la room 

            leftRoomClick: 0,

            updated: false,
        }
    },

    components: {
        SwipeView,
        VoteView,
        ResultsView,
        CustomBtn,
        ModaleInfoMain
    },

    async created() {
        socket.on(`updateRoom:${this.$route.params.roomCode}`, async () => {
            await this.updateRoom();
            this.setBucketRoom();
            this.updated = !this.updated;
        });
    },

    async mounted() {
        console.log(this.$route.params.roomCode);
        await this.updateRoom();
        await this.getFilms();
        this.setBucketRoom();

        console.log("route:",this.$route)

        this.ready = true;
    },

    methods: {
        setBucketRoom() {
            this.moviesBucketRoom = [];
            for(let i = 0; i < this.room.data.bucket.length; i++) {
                let film = this.movies.find(movie => movie.id == this.room.data.bucket[i].idFilm);
                film.weight = this.room.data.bucket[i].weight;
                this.moviesBucketRoom.push(film);
            }
        },
        async getFilms() {
            this.movies = await Promise.all(this.room.data.films.map(async film => {
                let f = await getMovie(film);
                return f.data;
            }));
        },
        async updateRoom() {
            this.room = await this.getRoom();

            //On vérifie que le watcher est bien dans la room, sinon on le redirige
            let watcherId = sessionStorage.getItem('watcherId');
            if(!watcherId || !this.room.data.watchers.find(watcher => watcher.id == watcherId)){
                this.$router.push({ name: 'home', query:{ code: this.$route.params.roomCode } });           
                return;
            }

            this.userStep = this.room.data.watchers.find(watcher => watcher.id == watcherId).step;
        },
        async getRoom() {
            let room = await get(`room/${this.$route.params.roomCode}`);

            //TODO faire une vraie page 404 un peu fun
            if (room.success === false) {
                this.$router.push({ name: 'home' });
            }

            return room;
        },

        async leftRoom() {
            if(this.leftRoomClick == 0) {
                this.leftRoomClick++;
                utils.showSnackbar('Appuyez à nouveau pour quitter', 2000)
                setTimeout(() => {
                    this.leftRoomClick = 0;
                }, 2000);
            } else {
                utils.hideSnackbar()
                let data = {
                    "code": this.$route.params.roomCode,
                    "watcher_id": sessionStorage.getItem('watcherId')
                }
                await del(`room/leave`, data);
                sessionStorage.removeItem('watcherId');
                this.$router.push({ name: 'home' });
            }
        },

        async validStep1() {
            let data = {
                "code": this.$route.params.roomCode,
                "watcher_id": sessionStorage.getItem('watcherId'),
                "films": []
            }

            //Pour chaque film dans le bucket, on ajoute l'id du film dans le tableau
            this.userBucket.forEach(film => {
                data.films.push(film.id);
            });

            await post('room/addFilmBucket', data);

            //TODO ajouter une vérification que c'est ok avant de passer à l'étape suivante
            this.userStep = 2;

            //On met à jour la room
            this.updateRoom();
        },

        async validStep2(films) {
            let data = {
                "code": this.$route.params.roomCode,
                "watcher_id": sessionStorage.getItem('watcherId'),
                "films": []
            }

            //Pour chaque film dans le bucket, on ajoute l'id du film dans le tableau
            films.forEach(film => {
                data.films.push({
                    "id": film.id,
                    "weight": film.note
                });
            });

            await post('room/voteForFilm', data);

            this.userStep = 3;

            //On met à jour la room
            this.updateRoom();
        },

        async copyToClipboard() {
            try {
                await navigator.clipboard.writeText(this.$route.params.roomCode);

                //On retire la classe symbolVisible et on l'ajoute à validCopySymbol
                let copySymbol = document.querySelector('.copySymbol');
                let validCopySymbol = document.querySelector('.validCopySymbol');

                copySymbol.classList.remove('symbolVisible');
                validCopySymbol.classList.add('symbolVisible');

                setTimeout(() => {
                    copySymbol.classList.add('symbolVisible');
                    validCopySymbol.classList.remove('symbolVisible');
                }, 1000);
            } catch (err) {
                console.error('Failed to copy: ', err);
                alert('Impossible de copier le code de la room');
            }

        },

        displayInfo() {
            document.getElementById('modaleInfoMain').classList.toggle('showModal');
        }
    },
};
</script>