import { Ref } from "vue";

export const uppercaseChar = (targetRef: Ref<string>) => {
  targetRef.value = targetRef.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
};