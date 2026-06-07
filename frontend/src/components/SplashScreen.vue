<template>
  <Transition name="splash" @after-leave="$emit('done')">
    <div v-if="visible" class="splash">
      <div class="splash-content" :class="{ 'in': contentIn }">
        <img src="@/assets/logo.png" alt="Match&Watch" class="splash-logo" />
        <h1 class="splash-title">Match &amp; Watch</h1>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineEmits<{ (e: 'done'): void }>()

const visible = ref(true)
const contentIn = ref(false)

onMounted(() => {
  setTimeout(() => { contentIn.value = true }, 80)
  setTimeout(() => { visible.value = false }, 2300)
})
</script>

<style scoped lang="scss">
.splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background:
    radial-gradient(ellipse 70% 50% at 30% 35%, rgba(118, 86, 245, 0.07) 0%, transparent 100%),
    radial-gradient(ellipse 50% 70% at 72% 65%, rgba(197, 72, 232, 0.05) 0%, transparent 100%),
    #1C1C1C;
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  opacity: 0;
  transform: scale(0.82) translateY(12px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);

  &.in {
    opacity: 1;
    transform: scale(1) translateY(0);

    .splash-logo {
      animation: logo-glow 2.8s ease-in-out infinite;
    }
  }
}

.splash-logo {
  width: 110px;
  height: 110px;
  border-radius: 24px;
}

.splash-title {
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: 5px;
  text-transform: uppercase;
  background: linear-gradient(135deg, #7656F5 0%, #C548E8 40%, #FF3D7F 65%, #7656F5 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3.5s ease-in-out infinite;
  margin: 0;

}

@keyframes logo-glow {
  0%, 100% {
    filter: drop-shadow(0 0 18px rgba(118, 86, 245, 0.35))
            drop-shadow(0 0 6px rgba(118, 86, 245, 0.15));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 32px rgba(197, 72, 232, 0.55))
            drop-shadow(0 0 12px rgba(197, 72, 232, 0.2));
    transform: scale(1.035);
  }
}

@keyframes shimmer {
  0%   { background-position: 100% 50%; }
  50%  { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

.splash-leave-active {
  transition: opacity 0.5s ease;
}
.splash-leave-to {
  opacity: 0;
}
</style>
