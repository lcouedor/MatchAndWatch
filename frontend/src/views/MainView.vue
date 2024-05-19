<template>
    <div class="bodyApp">
        <div class="headerMain">
            <div class="copyZone" @click="copyToClipboard">
                {{ $route.params.roomCode }}
                <div class="symbols">
                    <span class="copySymbol symbolVisible">
                        <img src="../assets/images/copy.png" alt="">
                    </span>
                    <span class="validCopySymbol">
                        <img src="../assets/images/check.png" alt="">
                    </span>
                </div>

            </div>

            <span class="info" @click="displayInfo" v-if="userStep == 1 || userStep == 2">i</span>

            <button class="leftRoom" @click="leftRoom">Quitter la room</button>


        </div>



        <SwipeView :room="room" :ready="ready" v-if="ready && userStep == 1" />
        <VoteView :room="room" :ready="ready" v-if="ready && userStep == 2" />
        <ResultsView :room="room" :ready="ready" v-if="ready && userStep == 3" />

        <ModaleInfoMain :page="userStep" />

    </div>

</template>

<script>
import { get, apiURL, post } from '@/api/services';
import { io } from "socket.io-client";

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

            userBucket: []
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
        socket.on(`updateRoom:${this.$route.params.roomCode}`, () => {
            this.updateRoom();
        });
    },

    async mounted() {
        console.log(this.$route.params.roomCode);
        await this.updateRoom();

        //On vérifie que le watcher est bien dans la room, sinon on le redirige
        let watcherId = sessionStorage.getItem('watcherId');
        if (!this.room.data.watchers.find(watcher => watcher.id == watcherId)) {
            this.$router.push({ name: 'home' });
        }

        this.ready = true;
    },

    methods: {
        async updateRoom() {
            this.room = await this.getRoom();

            let watcherId = sessionStorage.getItem('watcherId');
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

        leftRoom() {
            console.log(this.userBucket);
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