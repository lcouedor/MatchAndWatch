<template>

	<router-link to="/" class="homeLink"><h1>Match &amp; Watch</h1></router-link>

	<div class="buttonsHome">
		<Button @click="showModal('modaleCreateRoom')">{{ $t('home.create') }}</Button>
		<Button @click="showModal('modaleJoinRoom')" id="createRoom">{{ $t('home.join') }}</Button>
	</div>

	<div class="langSelector">
		<button
			class="langBtn"
			:class="{ active: locale === 'fr' }"
			@click="switchLocale('fr')"
		>🇫🇷</button>
		<button
			class="langBtn"
			:class="{ active: locale === 'en' }"
			@click="switchLocale('en')"
		>🇬🇧</button>
	</div>

	<div class="info" @click="showModal('modaleInfo')">i</div>
	<div class="appVersion">v{{ appVersion }}</div>

	<ModaleInfo ref="modaleInfo" :page="-1" />
	<ModaleCreateRoom ref="modaleCreateRoom" />
	<ModaleJoinRoom ref="modaleJoinRoom" />

</template>

<script setup lang="ts">
import Button from '@/components/Button.vue'
import ModaleInfo from '@/modales/ModaleInfo.vue'
import ModaleCreateRoom from '@/modales/ModaleCreateRoom.vue'
import ModaleJoinRoom from '@/modales/ModaleJoinRoom.vue'

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale, type SupportedLocale } from '@/i18n'
import { version as appVersion } from '../../package.json'

const { locale } = useI18n()

const switchLocale = (l: SupportedLocale) => setLocale(l)

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

<style scoped lang="scss">
.langSelector {
	display: flex;
	justify-content: center;
	gap: 12px;
	margin-top: 6vh;
}

.langBtn {
	background: transparent;
	border: 1.5px solid rgba(255, 255, 255, 0.1);
	border-radius: 50%;
	width: 40px;
	height: 40px;
	font-size: 1.4rem;
	cursor: pointer;
	transition: border-color 0.2s, transform 0.15s;
	display: flex;
	align-items: center;
	justify-content: center;

	&.active {
		border-color: rgba(118, 86, 245, 0.7);
		transform: scale(1.1);
	}
}

.appVersion {
	width: 100vw;
	margin-top: 1vh;
	text-align: center;
	font-size: 0.7rem;
	letter-spacing: 0.05em;
	color: rgba(224, 224, 224, 0.35);
}
</style>
