<template>
    <canvas ref="canvas" class="confettiCanvas" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let animFrame = 0
const COLORS = ['#7656F5', '#FF8A16', '#E0E0E0', '#FF6B6B', '#4ECDC4', '#FFD93D', '#B6ACFF']

interface Particle {
    x: number; y: number
    vx: number; vy: number
    rotation: number; rotationSpeed: number
    color: string
    w: number; h: number
    opacity: number
}

onMounted(() => {
    const cvs = canvas.value!
    cvs.width = window.innerWidth
    cvs.height = window.innerHeight
    const ctx = cvs.getContext('2d')!

    const particles: Particle[] = []
    let spawned = 0
    const MAX_SPAWN = 80

    const mk = (): Particle => ({
        x: Math.random() * cvs.width,
        y: -10,
        vx: (Math.random() - 0.5) * 5,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        w: Math.random() * 9 + 4,
        h: Math.random() * 5 + 3,
        opacity: 1,
    })

    const tick = () => {
        ctx.clearRect(0, 0, cvs.width, cvs.height)

        if (spawned < MAX_SPAWN) {
            particles.push(mk(), mk(), mk())
            spawned++
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i]
            p.x += p.vx
            p.y += p.vy
            p.vy += 0.05
            p.rotation += p.rotationSpeed
            if (p.y > cvs.height * 0.65) p.opacity -= 0.025
            if (p.opacity <= 0) { particles.splice(i, 1); continue }

            ctx.save()
            ctx.globalAlpha = p.opacity
            ctx.translate(p.x, p.y)
            ctx.rotate((p.rotation * Math.PI) / 180)
            ctx.fillStyle = p.color
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
            ctx.restore()
        }

        if (spawned < MAX_SPAWN || particles.length > 0) {
            animFrame = requestAnimationFrame(tick)
        }
    }

    animFrame = requestAnimationFrame(tick)
})

onUnmounted(() => cancelAnimationFrame(animFrame))
</script>

<style scoped>
.confettiCanvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 50;
}
</style>
