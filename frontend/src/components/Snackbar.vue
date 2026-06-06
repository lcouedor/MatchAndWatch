<template>
    <TransitionGroup name="snack" tag="div" class="snackbarContainer">
        <div
            v-for="snackbar in snackbars"
            :key="snackbar.id"
            class="snackbar"
        >
            {{ snackbar.message }}
        </div>
    </TransitionGroup>
</template>

<script setup lang="ts">
import { useSnackbar } from '../composables/useSnackbar'

const { snackbars } = useSnackbar()
</script>
