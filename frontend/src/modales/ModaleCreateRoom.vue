<template>
    <!-- TODO retirer les id si possible -->
    <ModalSlug modaleId="modaleCreateRoom" ref="modaleCreateRoom">
        <h1>Créer une Room</h1>

        <div class="inputBloc">
            <label>Plutôt sélection du film avec finesse, ou passer au plus vite au visionnage ?</label>
            <select v-model="selectedBucketSize">
                <option v-for="bucketSizeOption in bucketSizeOptions" :key="bucketSizeOption.value"
                    :value="bucketSizeOption.value" :selected="bucketSizeOption.default">
                    {{ bucketSizeOption.name }} - {{ bucketSizeOption.description }}
                </option>
            </select>
        </div>

        <div class="inputBloc">
            <label>Comment t'appelles-tu Padawan ?</label>
            <input v-model="inputNomWatcher" @input="handleInputNom()" maxlength="16" />
            <p class="errorMessage">{{ errorName }}</p>
        </div>

        <Spinner v-if="waiting">
            On recherche les meilleurs films pour toi
        </Spinner>

        <div class="buttonsModal">
            <Button @click="createRoom">Créer la Room</Button>
        </div>
    </ModalSlug>
</template>

<script setup lang="ts">
import Button from "@/components/Button.vue";
import { post } from "@/api/services";
import ModalSlug from "./ModalSlug.vue";
import { ref } from "vue";
import Spinner from "@/components/Spinner.vue";
import { useRouter } from 'vue-router'
import { uppercaseChar } from "@/utils/utils";


const router = useRouter()

interface BucketSizeOption {
    name: string;
    value: number;
    description: string;
    default: boolean;
}

const bucketSizeOptions: BucketSizeOption[] = [{ name: "Blitz", value: 3, description: "Pour les pressés", default: false },
{ name: "Standard", value: 5, description: "Pour les indécis", default: true },
{ name: "Odyssey", value: 10, description: "Pour les amoureux du ciné", default: false }];

const selectedBucketSize = ref<number>(bucketSizeOptions.find(option => option.default)?.value || 5);
const inputNomWatcher = ref<string>("");
const errorName = ref<string>("");
const modaleCreateRoom = ref<InstanceType<typeof ModalSlug> | null>(null);

const waiting = ref<boolean>(false)

const handleInputNom = () => {
    uppercaseChar(inputNomWatcher);
}

const createRoom = async () => {
    errorName.value = ""; // Reset des erreurs

    if (!inputNomWatcher.value) {
        errorName.value = "Hop là, pas si vite, il me faut ton nom !";
        return;
    }

    waiting.value = true; // Affichage du spinner

    const data = {
        bucket_size: selectedBucketSize.value,
    };

    const room = await post("room", data);

    // On ajoute ensuite le joueur à la room
    const watcherData = {
        code: room.data.code,
        watcher_name: inputNomWatcher.value,
    };

    const watcher = await post("room/join", watcherData);

    // On cache la modale
    modaleCreateRoom.value?.dismissModal();

    inputNomWatcher.value = "";
    waiting.value = false;

    // On enregistre l'id watcher dans le local storage
    sessionStorage.setItem("watcherId", watcher.data.watcher.id);

    // On redirige vers la room
    router.push("/match/" + room.data.code);
};

defineExpose({
    showModal() {
        modaleCreateRoom.value?.showModal();
    },
    dismissModal() {
        modaleCreateRoom.value?.dismissModal();
    }
})
</script>
