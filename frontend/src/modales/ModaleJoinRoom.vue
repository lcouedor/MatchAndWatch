<template>
    <ModalSlug modaleId="modaleJoinRoom" ref="modaleJoinRoom">
        <h1>Rejoindre une Room</h1>
            <div class="inputBloc">
                <label>Quel est le code de la room ?</label>
                <input v-model="inputRoomCodeContent" ref="inputRoomCode" @input="handleInputRoomCode()" maxlength="4">
                <p class="errorMessage">{{ errors.code }}</p>
            </div>

            <div class="inputBloc">
                <label>Comment t'appelles-tu Padawan ?</label>
                <input v-model="inputNomWatcherContent" ref="inputNomWatcher" @input="handleInputNom()" maxlength="16">
                <p class="errorMessage">{{ errors.name }}</p>
            </div>

            <div class="buttonsModal">
                <Button @click="joinRoom">Rejoindre la Room</Button>
            </div>
    </ModalSlug>
</template>

<script setup lang="ts">
import Button from "@/components/Button.vue";
import { post } from "@/api/services";
import ModalSlug from "./ModalSlug.vue";
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from 'vue-router'
import { uppercaseChar } from "@/utils/utils";


const router = useRouter();
const route = useRoute();

const inputRoomCodeContent = ref<string>('');
const inputNomWatcherContent = ref<string>('');

const modaleJoinRoom = ref<InstanceType<typeof ModalSlug> | null>(null);
const inputRoomCode = ref<HTMLInputElement | null>(null);
const inputNomWatcher = ref<HTMLInputElement | null>(null);

const errors = ref({
    code: '',
    name: '',
});

const handleInputRoomCode = () => {
    uppercaseChar(inputRoomCodeContent);
};

const handleInputNom = () => {
    uppercaseChar(inputNomWatcherContent);
};

const joinRoom = async () => {
    errors.value.name = '';
    inputNomWatcher.value?.classList.remove('errorInput');
    errors.value.code = '';
    inputRoomCode.value?.classList.remove('errorInput');
    //On vérifie que les champs ne sont pas vides
    let erreur: boolean = false;
    if (!inputNomWatcherContent.value) {
        //On ajoute la classe error à l'input
        inputNomWatcher.value?.classList.add('errorInput');

        //On ajoute un message d'erreur
        errors.value.name = 'Hop là, pas si vite, il me faut ton nom !';
        erreur = true;
    }
    if (!inputRoomCodeContent.value) {
        //On ajoute la classe error à l'input
        inputRoomCode.value?.classList.add('errorInput');

        //On ajoute un message d'erreur
        errors.value.code = 'Hop là, pas si vite, il me faut le code de la room !';
        erreur = true;
    }
    if (erreur) {
        return;
    }
    //Si tout est ok, on envoie la requête d'ajout du joueur à la room
    let data = {
        code: inputRoomCodeContent.value,
        watcher_name: inputNomWatcherContent.value,
    };
    let watcher = await post('room/join', data);
    if (!watcher.success) {
        errors.value.code = 'Hum, ce code ne semble pas valide...';
        inputRoomCode.value?.classList.add('errorInput');
        return;
    }
    //On cache la modale
    modaleJoinRoom.value?.dismissModal();
    //On reset les champs
    inputNomWatcherContent.value = '';
    inputRoomCodeContent.value = '';
    //On enregistre l'id watcher dans le session storage
    sessionStorage.setItem('watcherId', watcher.data.watcher.id);
    //On redirige vers la room
    router.push('/match/' + watcher.data.roomCode);
};

//au mount :
onMounted(() => {
    // const codeFromQuery = route.query.code as string | undefined
    // if (codeFromQuery) {
    //     inputRoomCodeContent.value = codeFromQuery.toUpperCase();
    //     handleInputRoomCode();
    // }
//     if(this.$route.query.code){
//         this.$refs.modalJoinRoom.classList.add("showModal");
//         this.$refs.inputRoomCode.value = this.$route.query.code;
//     }
}); 

defineExpose({
    showModal() {
        modaleJoinRoom.value?.showModal();
    },
    dismissModal() {
        modaleJoinRoom.value?.dismissModal();
    }
})
</script>