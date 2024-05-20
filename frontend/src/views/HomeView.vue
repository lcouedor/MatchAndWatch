<template>

	<h1>Match & Watch</h1>

	<div class="buttonsHome">
		<CustomBtn text="Créer une Room" @click="showModal('modaleCreateRoom')" />
		<CustomBtn text="Rejoindre une Room" @click="showModal('modaleJoinRoom')" id="createRoom"/>
	</div>

	<div class="info" @click="showModal('modaleInfo')">i</div>

	<ModaleInfo />
	<ModaleCreateRoom />
	<ModaleJoinRoom />

</template>

<script>
import CustomBtn from '@/components/Button.vue';
import ModaleInfo from '@/modales/ModaleInfo.vue';
import ModaleCreateRoom from '@/modales/ModaleCreateRoom.vue';
import ModaleJoinRoom from '@/modales/ModaleJoinRoom.vue';

export default {
	name: "HomeView",
	components: {
		CustomBtn,
		ModaleInfo,
		ModaleCreateRoom,
		ModaleJoinRoom,
	},
	
	props:{
		create: Boolean
	},

	methods: {
		showModal(modal) {
			document.getElementById(modal).classList.add("showModal");
		},

		hideModal(modal) {
			document.getElementById(modal).classList.remove("showModal");
		},
	},
};
</script>
