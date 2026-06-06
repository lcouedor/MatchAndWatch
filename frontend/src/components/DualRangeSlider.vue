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
            rgba(118,86,245,0.15) ${lo}%,
            #7656F5 ${lo}%,
            #C548E8 ${(lo + hi) / 2}%,
            #FF3D7F ${hi}%,
            rgba(118,86,245,0.15) ${hi}%)`
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
        background: linear-gradient(135deg, $primaryColor, $neonViolet);
        cursor: pointer;
        pointer-events: all;
        box-shadow: 0 0 10px rgba(197, 72, 232, 0.6), 0 0 20px rgba(255, 61, 127, 0.25);
    }

    &::-moz-range-thumb {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: linear-gradient(135deg, $primaryColor, $neonViolet);
        cursor: pointer;
        border: none;
        pointer-events: all;
        box-shadow: 0 0 10px rgba(197, 72, 232, 0.6), 0 0 20px rgba(255, 61, 127, 0.25);
    }
}
</style>
