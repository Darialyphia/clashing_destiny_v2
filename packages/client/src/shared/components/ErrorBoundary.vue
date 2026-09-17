<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';

const capturedError = ref<unknown>(null);
const renderKey = ref(0);

const reset = () => {
  capturedError.value = null;
  renderKey.value++;
};

const errorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};

onErrorCaptured(error => {
  capturedError.value = error;
  return false;
});

defineExpose({ reset });
</script>

<template>
  <slot v-if="!capturedError" :key="renderKey" />
  <slot v-else name="fallback" :error="capturedError" :reset="reset">
    <div role="alert">
      <strong>Something went wrong.</strong>
      <p>{{ errorMessage(capturedError) }}</p>
      <button type="button" @click="reset">Try again</button>
    </div>
  </slot>
</template>
