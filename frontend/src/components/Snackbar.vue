<template>
  <div v-if="visible" :class="['snackbar', { 'snackbarVisible': visible }]">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { useSnackbar } from '../composables/useSnackbar'

const { visible, message } = useSnackbar()
</script>
