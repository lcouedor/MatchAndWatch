let snackbarTimeout;

export function showSnackbar(message, ttl) {
    let snackbar = document.getElementById('snackbar');

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

export function hideSnackbar() {
    document.getElementById('snackbar').classList.remove('snackbarVisible');

    clearTimeout(snackbarTimeout);
}