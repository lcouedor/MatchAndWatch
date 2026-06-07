<template>
    <ModalSlug modaleId="modaleJoinRoom" ref="modaleJoinRoom">
        <h1>{{ $t('joinRoom.title') }}</h1>
        <div class="inputBloc">
            <label>{{ $t('joinRoom.code') }}</label>
            <input v-model="inputRoomCodeContent" ref="inputRoomCode" @input="handleInputRoomCode()" maxlength="4">
            <p class="errorMessage">{{ errors.code }}</p>
        </div>

        <div class="inputBloc">
            <label>{{ $t('joinRoom.yourName') }}</label>
            <input v-model="inputNomWatcherContent" ref="inputNomWatcher" @input="handleInputNom()" maxlength="16">
            <p class="errorMessage">{{ errors.name }}</p>
        </div>

        <div class="buttonsModal">
            <Button @click="joinRoom">{{ $t('joinRoom.joinBtn') }}</Button>
        </div>
    </ModalSlug>
</template>

<script setup lang="ts">
import Button from "@/components/Button.vue";
import { post } from "../api/services";
import ModalSlug from "./ModalSlug.vue";
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { uppercaseChar } from "../utils/utils";
import { Watcher } from "shared-types/watcher";
import { apiResponse } from "shared-types/apiResponse";


const { t } = useI18n()
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
        errors.value.name = t('joinRoom.errorName');
        erreur = true;
    }
    if (!inputRoomCodeContent.value) {
        //On ajoute la classe error à l'input
        inputRoomCode.value?.classList.add('errorInput');

        //On ajoute un message d'erreur
        errors.value.code = t('joinRoom.errorCode');
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
    let watcher: apiResponse<Watcher> | null = await post<Watcher>('room/join/', data);
    if (!watcher.success) {
        errors.value.code = watcher.error || t('joinRoom.errorServer');
        inputRoomCode.value?.classList.add('errorInput');
        return;
    }
    modaleJoinRoom.value?.dismissModal();
    sessionStorage.setItem('watcherId', (watcher.data?.id ?? '').toString());
    router.push('/match/' + inputRoomCodeContent.value);
};

onMounted(() => {
    const codeFromQuery = route.query.code as string | undefined
    if (codeFromQuery) {
        modaleJoinRoom.value?.showModal();
        inputRoomCodeContent.value = codeFromQuery.toUpperCase();
        inputNomWatcher.value?.focus();
    }
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