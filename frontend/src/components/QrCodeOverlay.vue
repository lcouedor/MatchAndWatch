<template>
    <Teleport to="body">
        <Transition name="qr-overlay">
            <div v-if="show" class="qrOverlayBackdrop" @click.self="$emit('close')">
                <div class="qrOverlayCard">
                    <p class="qrLabel">Rejoindre la room</p>

                    <div class="qrCode">
                        <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR code" />
                        <div v-else class="qrPlaceholder" />
                    </div>

                    <p class="qrSep">ou entrer le code</p>

                    <p class="qrRoomCode">{{ roomCode }}</p>

                    <button class="copyBtn" @click="copyCode">
                        <span v-if="copied">✓ Copié !</span>
                        <span v-else>Copier le code</span>
                    </button>

                    <button class="closeBtn" @click="$emit('close')">Fermer</button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps<{ show: boolean; roomCode: string }>()
defineEmits<{ (e: 'close'): void }>()

const qrDataUrl = ref('')
const copied = ref(false)

watch(() => props.show, async (visible) => {
    if (visible && !qrDataUrl.value) {
        const base = process.env.VUE_APP_PUBLIC_URL || window.location.origin
    const url = `${base}/?code=${props.roomCode}`
        qrDataUrl.value = await QRCode.toDataURL(url, {
            width: 240,
            margin: 2,
            color: { dark: '#1C1C1C', light: '#E0E0E0' },
        })
    }
}, { immediate: true })

const copyCode = async () => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(props.roomCode)
        } else {
            const ta = document.createElement('textarea')
            ta.value = props.roomCode
            ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;'
            document.body.appendChild(ta)
            ta.focus(); ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
        }
        copied.value = true
        setTimeout(() => { copied.value = false }, 1500)
    } catch {
        alert('Impossible de copier le code')
    }
}
</script>

<style lang="scss" scoped>
@use '../assets/style/variables' as *;

.qrOverlayBackdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
}

.qrOverlayCard {
    background: #252525;
    border-radius: 24px;
    padding: 28px 28px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
    width: min(320px, 90vw);
}

.qrLabel {
    color: $textColorPrimary;
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
}

.qrCode {
    border-radius: 14px;
    overflow: hidden;
    border: 3px solid $primaryColor;
    flex-shrink: 0;

    img {
        display: block;
        width: 220px;
        height: 220px;
    }
}

.qrPlaceholder {
    width: 220px;
    height: 220px;
    background: rgba(255, 255, 255, 0.05);
}

.qrSep {
    font-size: 0.75rem;
    color: rgba(224, 224, 224, 0.35);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.qrRoomCode {
    font-size: 2.4rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: $primaryColor;
    margin: 0;
    line-height: 1;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.copyBtn {
    background: rgba(118, 86, 245, 0.15);
    border: 1.5px solid rgba(118, 86, 245, 0.4);
    color: #B6ACFF;
    border-radius: $stdRadius;
    padding: 10px 28px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    width: 100%;

    &:active { background: rgba(118, 86, 245, 0.28); }
}

.closeBtn {
    background: transparent;
    border: 1.5px solid rgba(224, 224, 224, 0.12);
    color: rgba(224, 224, 224, 0.4);
    border-radius: $stdRadius;
    padding: 8px 24px;
    font-size: 0.85rem;
    cursor: pointer;
    width: 100%;
}

.qr-overlay-enter-active { transition: opacity 0.2s ease; }
.qr-overlay-leave-active { transition: opacity 0.18s ease; }
.qr-overlay-enter-from, .qr-overlay-leave-to { opacity: 0; }
</style>
