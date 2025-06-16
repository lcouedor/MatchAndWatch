import { Ref } from "vue";
import { useSnackbar } from '../composables/useSnackbar';

export const uppercaseChar = (targetRef: Ref<string>) => {
    targetRef.value = targetRef.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
};

export function triggerSnackbar(message: string, ttl = 3000) {
    console.log("triggerSnackbar", message, ttl)
    const { showSnackbar } = useSnackbar()
    showSnackbar(message, ttl)
}

export function hideSnackbar() {
    const { hideSnackbar } = useSnackbar()
    hideSnackbar()
}
