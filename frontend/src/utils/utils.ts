import { Ref } from "vue";
import { useSnackbar } from '../composables/useSnackbar';

export const uppercaseChar = (targetRef: Ref<string>) => {
    targetRef.value = targetRef.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
};

export function triggerSnackbar(message: string, ttl = 3000): number {
    const { showSnackbar } = useSnackbar()
    const snackbarId = showSnackbar(message, ttl);
    return snackbarId;
}

export function hideSnackbar(id: number) {
    const { hideSnackbar } = useSnackbar()
    hideSnackbar(id)
}
