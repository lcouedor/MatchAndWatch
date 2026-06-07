<template>
  <div class="coldstart">
    <img src="@/assets/logo.png" alt="Match&Watch" class="coldstart-logo" />
    <h2 class="coldstart-title">Match &amp; Watch</h2>

    <div class="dots">
      <span class="dot" />
      <span class="dot" />
      <span class="dot" />
    </div>

    <Transition name="msg" mode="out-in">
      <p :key="msgIndex" class="coldstart-msg">{{ messages[msgIndex] }}</p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const messages = [
  'Le serveur sort du lit... 🛏️',
  'Réveil en douceur des algorithmes...',
  'Patience, ça vaut le coup je promets 🎬',
  'Connexion aux serveurs d\'Hollywood...',
  'En train d\'analyser 50 ans de cinéma...',
  'Le serveur cherche ses clés 🔑',
  'Mise en chauffe des circuits de concordance™',
  'On a dit à Render que c\'était urgent...',
  'Téléchargement de bonnes vibrations... ✨',
]

const msgIndex = ref(0)
let interval: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {
    msgIndex.value = (msgIndex.value + 1) % messages.length
  }, 3800)
})

onUnmounted(() => clearInterval(interval))
</script>

<style scoped lang="scss">
.coldstart {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background:
    radial-gradient(ellipse 70% 50% at 30% 35%, rgba(118, 86, 245, 0.07) 0%, transparent 100%),
    radial-gradient(ellipse 50% 70% at 72% 65%, rgba(197, 72, 232, 0.05) 0%, transparent 100%),
    #1C1C1C;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  padding: 40px;
  animation: fade-in 0.5s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.coldstart-logo {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  animation: logo-pulse 3s ease-in-out infinite;
}

@keyframes logo-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 14px rgba(118, 86, 245, 0.3));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 26px rgba(197, 72, 232, 0.5));
    transform: scale(1.04);
  }
}

.coldstart-title {
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  background: linear-gradient(135deg, #7656F5 0%, #C548E8 50%, #FF3D7F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;

}

.dots {
  display: flex;
  gap: 9px;
  margin: 4px 0;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7656F5;
    animation: bounce 1.3s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.22s;
    }
    &:nth-child(3) {
      animation-delay: 0.44s;
    }
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.35;
    background: #7656F5;
  }
  40% {
    transform: translateY(-13px);
    opacity: 1;
    background: #C548E8;
  }
}

.coldstart-msg {
  color: rgba(224, 224, 224, 0.55);
  font-size: 0.92rem;
  text-align: center;
  max-width: 270px;
  line-height: 1.6;
  min-height: 3.2em;
  margin: 0;
}

.msg-enter-active,
.msg-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.msg-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.msg-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
