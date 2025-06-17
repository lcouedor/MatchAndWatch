<template>
  <div :id="modaleId" class="modal" ref="modalRef">
    <div class="dismissModal">
      <div class="dismissButton" @click="dismissModal">✗</div>
    </div>
    <div class="backdrop"></div>

    <div class="modalBody">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";

defineProps<{
  modaleId: string;
}>();

const modalRef = ref<HTMLElement | null>(null);

const dismissModal = () => {
  if (modalRef.value) {
    modalRef.value.classList.remove("showModal");
  }
};

const showModal = () => {
  if (modalRef.value) {
    modalRef.value.classList.add("showModal");
  }
};

defineExpose({dismissModal, showModal});
</script>