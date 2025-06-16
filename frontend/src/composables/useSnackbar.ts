import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
let timeout: number | null = null

function showSnackbar(newMessage: string, ttl = 3000) {
  message.value = newMessage
  visible.value = true

  if (timeout) {
    clearTimeout(timeout)
  }

  timeout = window.setTimeout(() => {
    visible.value = false
    timeout = null
  }, ttl)
}

function hideSnackbar() {
  visible.value = false
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
}

export function useSnackbar() {
  return {
    visible,
    message,
    showSnackbar,
    hideSnackbar,
  }
}
