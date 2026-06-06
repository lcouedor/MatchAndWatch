<template>
    <div class="dualRange">
        <div class="track" :style="trackStyle"></div>
        <input
            type="range"
            class="thumb"
            :min="min" :max="max" :step="step"
            :value="minValue"
            @input="onMin"
        />
        <input
            type="range"
            class="thumb"
            :min="min" :max="max" :step="step"
            :value="maxValue"
            @input="onMax"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    min: number
    max: number
    step: number
    minValue: number
    maxValue: number
}>()

const emit = defineEmits<{
    (e: 'update:minValue', v: number): void
    (e: 'update:maxValue', v: number): void
}>()

const pct = (v: number) => ((v - props.min) / (props.max - props.min)) * 100

const trackStyle = computed(() => {
    const lo = pct(Math.min(props.minValue, props.maxValue))
    const hi = pct(Math.max(props.minValue, props.maxValue))
    return {
        background: `linear-gradient(to right,
            rgba(118,86,245,0.2) ${lo}%,
            #7656F5 ${lo}%,
            #7656F5 ${hi}%,
            rgba(118,86,245,0.2) ${hi}%)`
    }
})

const onMin = (e: Event) => {
    const input = e.target as HTMLInputElement
    const v = parseFloat(input.value)
    const clamped = Math.min(v, props.maxValue - props.step)
    if (v !== clamped) input.value = String(clamped)
    emit('update:minValue', clamped)
}

const onMax = (e: Event) => {
    const input = e.target as HTMLInputElement
    const v = parseFloat(input.value)
    const clamped = Math.max(v, props.minValue + props.step)
    if (v !== clamped) input.value = String(clamped)
    emit('update:maxValue', clamped)
}
</script>

<style lang="scss" scoped>
@use '../assets/style/variables' as *;

.dualRange {
    position: relative;
    height: 26px;
    display: flex;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
}

.track {
    position: absolute;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    pointer-events: none;
}

.thumb {
    position: absolute;
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    pointer-events: none;
    outline: none;
    margin: 0;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: $primaryColor;
        cursor: pointer;
        pointer-events: all;
        box-shadow: 0 0 8px rgba(118, 86, 245, 0.5);
    }

    &::-moz-range-thumb {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: $primaryColor;
        cursor: pointer;
        border: none;
        pointer-events: all;
        box-shadow: 0 0 8px rgba(118, 86, 245, 0.5);
    }
}
</style>
