<template>
  <div id="mainApp">
    <router-view />
    <div id="snackbar"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import '@/assets/style/main.scss'

onMounted(() => {
  document.title = 'Match&Watch'
})
</script>