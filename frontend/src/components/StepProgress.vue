<template>
    <div class="stepProgress">
        <span class="progressText">{{ done }} / {{ total }} {{ label }}</span>
        <div class="progressBar">
            <div class="progressFill" :style="{ width: percent + '%' }"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    done: number
    total: number
    label?: string
}>()

const percent = computed(() =>
    props.total > 0 ? Math.round((props.done / props.total) * 100) : 0
)
</script>

<style lang="scss" scoped>
@use '../assets/style/variables' as *;

.stepProgress {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    box-sizing: border-box;
    padding: 0 2vh;
}

.progressText {
    font-size: 0.82rem;
    color: rgba(224, 224, 224, 0.55);
}

.progressBar {
    height: 4px;
    background: rgba(118, 86, 245, 0.2);
    border-radius: 3px;
    overflow: hidden;
}

.progressFill {
    height: 100%;
    background: $primaryColor;
    border-radius: 3px;
    transition: width 0.4s ease;
}
</style>
