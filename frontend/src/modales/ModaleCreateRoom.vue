<template>
    <div id="modaleCreateRoom" class="modal">
        <div class="dismissModal">
            <div class="dismissButton" @click="dismissModal">✗</div>
        </div>
        <div class="backdrop"></div>

        <div class="modalBody">
            <h1>Créer une Room</h1>

            <div class="inputBloc">
                <label>Combien de personnes au maximum dans la room ?</label>
                <select ref="selectRoomSize">
                    <option v-for="roomSizeOption in roomSizeOptions" :value="roomSizeOption">{{ roomSizeOption }} personnes</option>
                </select>
            </div>

            <div class="inputBloc">
                <label>Combien de films souhaites-tu matcher au maximum ?</label>
                <select ref="selectBucketSize">
                    <option v-for="bucketSizeOption in bucketSizeOptions" :value="bucketSizeOption">{{ bucketSizeOption }} films</option>
                </select>
            </div>

            <div class="inputBloc">
                <label>Comment t'appelles-tu Padawan ?</label>
                <input ref="inputNomCreateRoom" @input="uppercaseChar('inputNomCreateRoom')" maxlength="16">
                <p class="errorMessage">{{ errors.name }}</p>
            </div>

            <div class="waiting">
                <div class="spin"></div>
                <p>On recherche les meilleurs films pour toi</p>
            </div>

            <div class="buttonsModal">
                <CustomBtn text="Créer la Room" @click="createRoom"/>
            </div>
            
        </div>
    </div>
</template>

<script>
import CustomBtn from '@/components/Button.vue';
import { post } from '@/api/services';

export default {
    name: 'ModaleCreateRoom',

    components: {
        CustomBtn
    },

    data() {
        return {
            roomSizeOptions: [2, 3, 4, 5, 6, 7, 8, 9, 10],
            bucketSizeOptions: [5, 10, 15, 20],

            errors: {
                name: ''
            }
        }
    },

    methods: {
        dismissModal() {
            this.$parent.hideModal('modaleCreateRoom');
        },

        uppercaseChar(ref){
            let input = this.$refs[ref];
            //Si c'est autre chose qu'une lettre ou un chiffre, on retire
            input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
            input.value = input.value.toUpperCase();
        },

        async createRoom(){
            //Reset des erreurs et des classes d'erreur
            this.errors.name = '';
            this.$refs.inputNomCreateRoom.classList.remove('errorInput');

            //On vérifie que les champs sont bien remplis
            if(!this.$refs.inputNomCreateRoom.value){
                //On ajoute la classe error à l'input
                this.$refs.inputNomCreateRoom.classList.add('errorInput');

                //On ajoute un message d'erreur
                this.errors.name = 'Hop là, pas si vite, il me faut ton nom !';
                return;
            }

            document.querySelector('.waiting').classList.add('waitingVisible');

            //Si tout est ok, on envoie la requête de création de room
            let data = {
                room_size: this.$refs.selectRoomSize.value,
                bucket_size: this.$refs.selectBucketSize.value,
            }
            let room = await post('room', data)

            // On ajoute ensuite le joueur à la room
            data = {
                code: room.data.code,
                watcher_name: this.$refs.inputNomCreateRoom.value
            }
            let watcher = await post('room/join', data)

            //On cache la modale
            this.$parent.hideModal('modaleCreateRoom');

            //On reset les champs
            this.$refs.inputNomCreateRoom.value = '';

            document.querySelector('.waiting').classList.remove('waitingVisible');

            //On enregistre l'id watcher dans le local storage
            sessionStorage.setItem('watcherId', watcher.data.watcher.id);

            this.$router.push('/match/'+room.data.code);
        }
    }
}
</script>