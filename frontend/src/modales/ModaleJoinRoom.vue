<template>
    <div id="modaleJoinRoom" class="modal">
        <div class="dismissModal">
            <div class="dismissButton" @click="dismissModal">✗</div>
        </div>
        <div class="backdrop"></div>

        <div class="modalBody">
            <h1>Rejoindre une Room</h1>

            <div class="inputBloc">
                <label>Quel est le code de la room ?</label>
                <input ref="inputRoomCode" @input="uppercaseChar('inputRoomCode')" maxlength="4">
                <p class="errorMessage">{{ errors.code }}</p>
            </div>

            <div class="inputBloc">
                <label>Comment t'appelles-tu Padawan ?</label>
                <input ref="inputNomJoinRoom" @input="uppercaseChar('inputNomJoinRoom')">
                <p class="errorMessage">{{ errors.name }}</p>
            </div>

            <div class="buttonsModal">
                <CustomBtn text="Rejoindre la Room" @click="joinRoom" />
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
            errors: {
                code: '',
                name: '',
            }
        }
    },

    methods: {
        dismissModal() {
            this.$parent.hideModal('modaleJoinRoom');
        },

        uppercaseChar(ref){
            let input = this.$refs[ref];
            //Si c'est autre chose qu'une lettre ou un chiffre, on retire
            input.value = input.value.replace(/[^a-zA-Z0-9]/g, '');
            input.value = input.value.toUpperCase();
        },

        async joinRoom() {
            //Reset des erreurs et des classes d'erreur
            this.errors.name = '';
            this.$refs.inputNomJoinRoom.classList.remove('errorInput');
            this.errors.code = '';
            this.$refs.inputRoomCode.classList.remove('errorInput');

            //On vérifie que les champs sont bien remplis
            let erreur = false;
            if(!this.$refs.inputNomJoinRoom.value){
                //On ajoute la classe error à l'input
                this.$refs.inputNomJoinRoom.classList.add('errorInput');

                //On ajoute un message d'erreur
                this.errors.name = 'Hop là, pas si vite, il me faut ton nom !';
                erreur = true;
            }

            if(!this.$refs.inputRoomCode.value){
                //On ajoute la classe error à l'input
                this.$refs.inputRoomCode.classList.add('errorInput');

                //On ajoute un message d'erreur
                this.errors.code = 'Hop là, pas si vite, il me faut le code de la room !';
                erreur = true;
            }

            if(erreur){
                return;
            }

            //Si tout est ok, on envoie la requête d'ajout du joueur à la room
            let data = {
                code: this.$refs.inputRoomCode.value,
                watcher_name: this.$refs.inputNomJoinRoom.value,
            }

            let watcher = await post('room/join', data)

            if(!watcher.success){
                this.errors.code = 'Hum, ce code ne semble pas valide...';
                this.$refs.inputRoomCode.classList.add('errorInput');
                return;
            }

            //On cache la modale
            this.$parent.hideModal('modaleJoinRoom');

            //On reset les champs
            this.$refs.inputNomJoinRoom.value = '';
            this.$refs.inputRoomCode.value = '';

            //On enregistre l'id watcher dans le local storage
            sessionStorage.setItem('watcherId', watcher.data.watcher.id);

            // console.log(watcher.data.roomCode);
            this.$router.push('/match/'+watcher.data.roomCode);
        }
    }
}
</script>