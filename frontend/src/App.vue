<template>
  <div id="mainApp">
    <SplashScreen v-if="showSplash" @done="onSplashDone" />
    <ColdStartScreen v-else-if="!backendReady" />
    <template v-else>
      <router-view />
      <Snackbar />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import '@/assets/style/main.scss'
import axios from 'axios'
import Snackbar from '@/components/Snackbar.vue'
import SplashScreen from '@/components/SplashScreen.vue'
import ColdStartScreen from '@/components/ColdStartScreen.vue'

const showSplash = ref(true)
const backendReady = ref(false)

const pingUntilReady = async () => {
  const apiURL = process.env.VUE_APP_API_URL
  while (!backendReady.value) {
    try {
      await axios.get(`${apiURL}/`, { timeout: 12000 })
      backendReady.value = true
    } catch {
      await new Promise(r => setTimeout(r, 3000))
    }
  }
}

const onSplashDone = () => {
  showSplash.value = false
}

onMounted(() => {
  document.title = 'Match&Watch'
  pingUntilReady()
})
</script>
