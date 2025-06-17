<template>
    <div
      v-for="(snackbar, index) in snackbars"
      :key="snackbar.id"
      class="snackbar snackbarVisible"
      :style="{ bottom: `${2 + index * 6}%` }"
    >
      {{ snackbar.message }}
    </div>
</template>

<script setup lang="ts">
import { useSnackbar } from '../composables/useSnackbar'

const { snackbars } = useSnackbar()
</script>
