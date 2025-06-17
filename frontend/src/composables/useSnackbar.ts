import { ref, reactive } from 'vue'

interface SnackbarItem {
  id: number
  message: string
  ttl: number
  timeout?: number
}

const snackbars = reactive<SnackbarItem[]>([])
let nextId = 0

export function useSnackbar() {
  function showSnackbar(message: string, ttl = 3000) {
    const id = nextId++
    const snackbar: SnackbarItem = { id, message, ttl }
    snackbars.push(snackbar)

    snackbar.timeout = window.setTimeout(() => {
      const index = snackbars.findIndex((s) => s.id === id)
      if (index !== -1) snackbars.splice(index, 1)
    }, ttl)

    return id
  }

  function hideSnackbar(id: number) {
    const index = snackbars.findIndex((s) => s.id === id)
    if (index !== -1) {
      clearTimeout(snackbars[index].timeout)
      snackbars.splice(index, 1)
    }
  }

  return {
    snackbars,
    showSnackbar,
    hideSnackbar
  }
}
