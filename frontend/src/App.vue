<template>
  <div id="app">
    <router-view />
    <Snackbar />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import '@/assets/style/main.scss'
import Snackbar from '@/components/Snackbar.vue'

onMounted(() => {
  document.title = 'Match&Watch'
})
</script>