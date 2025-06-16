<template>

	<h1>Match & Watch</h1>

	<div class="buttonsHome">
		<Button @click="showModal('modaleCreateRoom')">Créer une room</Button>
		<Button @click="showModal('modaleJoinRoom')" id="createRoom">Rejoindre une Room</Button>
	</div>

	<div class="info" @click="showModal('modaleInfo')">i</div>

	<ModaleInfo ref="modaleInfo" :page="0" />
	<ModaleCreateRoom ref="modaleCreateRoom" />
	<ModaleJoinRoom ref="modaleJoinRoom" />

</template>

<script setup lang="ts">
import Button from '@/components/Button.vue'
import ModaleInfo from '@/modales/ModaleInfo.vue'
import ModaleCreateRoom from '@/modales/ModaleCreateRoom.vue'
import ModaleJoinRoom from '@/modales/ModaleJoinRoom.vue'

import { ref } from 'vue'

const modaleInfo = ref<InstanceType<typeof ModaleInfo> | null>(null);
const modaleCreateRoom = ref<InstanceType<typeof ModaleCreateRoom> | null>(null);
const modaleJoinRoom = ref<InstanceType<typeof ModaleJoinRoom> | null>(null);

const showModal = (modaleId: string) => {
	switch (modaleId) {
		case 'modaleInfo':
			modaleInfo.value?.$el.classList.add('showModal');
			break;
		case 'modaleCreateRoom':
			modaleCreateRoom.value?.showModal();
			break;
		case 'modaleJoinRoom':
			modaleJoinRoom.value?.showModal();
			break;
		default:
			console.warn(`Unknown modal ID: ${modaleId}`);
	}
};
</script>
