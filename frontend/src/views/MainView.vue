<template>
    <div class="bodyApp">
        <div class="headerMain">
            <div class="copyZone normalButton">
                {{ roomCode }}
                <div class="symbols" @click="copyToClipboard">
                    <span ref="copySymbol" class="copySymbol symbolVisible">
                        <img src="../assets/images/copy.png" alt="">
                    </span>
                    <span ref="validCopySymbol" class="validCopySymbol">
                        <img src="../assets/images/check.png" alt="">
                    </span>
                </div>
            </div>

            <button class="leftRoom normalButton" @click="leftRoom">Exit</button>

            <span class="info" @click="" v-if="userStep == 1 || userStep == 2">i</span>
        </div>

        <SwipeView :room="room" :ready="ready" :movies="moviesBucketRoom" :userBucket="userBucket" v-if="userStep == 0" @validStep1="validStep1"/>
        <VoteView :room="room" :ready="ready" :movies="moviesBucketRoom" v-if="userStep == 1" />
        <!-- <ResultsView :room="room" :ready="ready" :movies="moviesBucketRoom" :updated="updated" v-if="userStep == 2" /> -->

        <ModaleInfoMain :page="userStep" />

    </div>

</template>

<script setup lang="ts">
import { io } from "socket.io-client";
import { get, del, post } from '../api/services';

import SwipeView from '@/views/SwipeView.vue';
import VoteView from '@/views/VoteView.vue';
import ResultsView from '@/views/ResultsView.vue';
import CustomBtn from '@/components/Button.vue';
import ModaleInfoMain from '@/modales/ModaleInfoMain.vue';
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, watch } from "vue";
import { showSnackbar, hideSnackbar } from '../utils/utils';



import { Room } from '../../../shared-types/room';
import { Watcher } from '../../../shared-types/watcher';
import { apiResponse } from 'shared-types/apiResponse';
import { TMDBFilm } from '../../../shared-types/tmdb';

const socket = io(process.env.VUE_APP_API_URL || "");

const route: any = useRoute();
const router = useRouter();
const roomCode: string = route.params.roomCode as string;

const copySymbol = ref<HTMLElement | null>(null);
const validCopySymbol = ref<HTMLElement | null>(null);

const room = ref<Room | null>(null);
const moviesBucketRoom = ref<TMDBFilm[]>([]); // Films in the bucket of the room
const userBucket = ref<TMDBFilm[]>([]); // Films selected by the user
const ready = ref<boolean>(false);
const userStep = ref<number>(0); // 1: Choix des films, 2: Vote, 3: Résultats
const leftRoomClick = ref<number>(0);

onMounted(async () => {
    console.log('Mounted MainView');
    await updateRoom();
    moviesBucketRoom.value = await getFilms();

    socket.on(`updateRoom:${roomCode}`, async () => {
        console.log('Room updated by socket');
        await updateRoom();
        moviesBucketRoom.value = await getFilms();
    });

    ready.value = true;
});

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(roomCode);
        copySymbol.value?.classList.remove('symbolVisible');
        validCopySymbol.value?.classList.add('symbolVisible');
        setTimeout(() => {
            copySymbol.value?.classList.add('symbolVisible');
            validCopySymbol.value?.classList.remove('symbolVisible');
        }, 1000);
    } catch (err) {
        alert('Impossible de copier le code de la room');
    }
};

const leftRoom = async () => {
    if (leftRoomClick.value == 0) {
        leftRoomClick.value++;
        showSnackbar('Appuyez à nouveau pour quitter', 2000)
        setTimeout(() => {
            leftRoomClick.value = 0;
        }, 2000);
    } else {
        hideSnackbar();
        const data = {
            code: roomCode,
            watcher_id: sessionStorage.getItem('watcherId')
        };
        await del('room/leave', data);
        sessionStorage.removeItem('watcherId');
        // Redirect to home
        router.push({ name: 'home' });
    }
};

const updateRoom = async () => {
    room.value = await getRoom();

    // Check if watcher is in the room, otherwise redirect
    const watcherId: number | null = parseInt(sessionStorage.getItem('watcherId') || '');

    if (
        !watcherId ||
        !room.value?.watchers ||
        !room.value.watchers.find((watcher: Watcher) => watcher.id == watcherId)
    ) {
        router.push({ name: 'home', query: { code: roomCode } });
        return;
    }

    const foundWatcher = room.value.watchers.find((watcher: Watcher) => watcher.id == watcherId);
    userStep.value = foundWatcher ? foundWatcher.step : 0;
};

const getRoom = async (): Promise<Room> => {
    const roomData: apiResponse<Room> = await get<Room>(`room/${roomCode}`, {});

    if (roomData.success === false) {
        router.push({ name: 'home' });
        return {} as Room; // Return an empty Room object
    }

    return roomData.data as Room;
};

const getFilms = async (): Promise<any[]> => {
    if (!room.value?.bucket) {
        return [];
    }
    return await Promise.all(room.value.bucket.map(async (film) => {
        const response: apiResponse<TMDBFilm> = await get<TMDBFilm>(`movie`, {movieId: film.film_id});
        return response.data;
    }));
};

const validStep1 = async () => {
    const data = {
        code: roomCode,
        watcher_id: sessionStorage.getItem('watcherId'),
        step: 1,
        filmIds: userBucket.value.map(film => film.id)
    };

    const response: apiResponse<any> = await post('room/addFilmBucket', data);
    if (response.success) {
        userStep.value = 1;
        await updateRoom();
    } else {
        alert('Erreur lors de l\'ajout des films au bucket');
    }
};

// const validStep2 = async (films: TMDBFilm[]) => {
//     const data = {
//         code: roomCode,
//         watcher_id: sessionStorage.getItem('watcherId'),
//         films: films.map(film => ({
//             id: film.id,
//             weight: film
//         }))
//     };

//     const response: apiResponse<any> = await get('room/voteForFilm', data);

//     if (response.success) {
//         userStep.value = 2;
//         await updateRoom();
//     } else {
//         alert('Erreur lors du vote pour les films');
//     }
// };



// async created() {
//     // socket.on(`updateRoom:${this.$route.params.roomCode}`, async () => {
//     //     await this.updateRoom();
//     //     this.setBucketRoom();
//     //     this.updated = !this.updated;
//     // });
// },

//     displayInfo() {
//         document.getElementById('modaleInfoMain').classList.toggle('showModal');
//     }
</script>