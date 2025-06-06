import { Ref } from "vue";

export const uppercaseChar = (targetRef: Ref<string>) => {
  targetRef.value = targetRef.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
};

let snackbarTimeout: ReturnType<typeof setTimeout>;

export function showSnackbar(message: string, ttl: number): void {
    const snackbar = document.getElementById('snackbar');

    if (!snackbar) return;

    // Si la snackbar est déjà visible, réinitialiser le timeout
    if (snackbar.classList.contains('snackbarVisible')) {
        clearTimeout(snackbarTimeout);
    }

    snackbar.innerHTML = message;
    snackbar.classList.add('snackbarVisible');

    snackbarTimeout = setTimeout(() => {
        hideSnackbar();
    }, ttl);
}

export function hideSnackbar(): void {
    const snackbar = document.getElementById('snackbar');
    if (!snackbar) return;

    snackbar.classList.remove('snackbarVisible');
    clearTimeout(snackbarTimeout);
}
