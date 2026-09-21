<script setup lang="ts">
import {
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastViewport,
  ToastClose
} from 'reka-ui';
import { useToast } from '../composables/useToast';

const { toasts, remove } = useToast();
</script>

<template>
  <ToastRoot
    v-for="toast in toasts"
    :key="toast.id"
    class="ui-toast"
    :class="`is-${toast.variant}`"
    :duration="toast.duration"
    :open="toast.open"
    @update:open="
      opened => {
        if (!opened) remove(toast.id);
      }
    "
  >
    <ToastTitle class="ui-toast-title">{{ toast.title }}</ToastTitle>
    <ToastDescription v-if="toast.description" class="ui-toast-description">
      {{ toast.description }}
    </ToastDescription>
    <ToastClose class="ui-toast-close" aria-label="Dismiss">×</ToastClose>
  </ToastRoot>

  <ToastViewport class="ui-toast-viewport" />
  <div class="test" />
</template>

<style lang="postcss">
.ui-toast-viewport {
  --viewport-padding: 25px;
  position: fixed;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: var(--viewport-padding);
  gap: 10px;
  width: 390px;
  max-width: 100vw;
  margin: 0;
  list-style: none;
  z-index: 2147483647;
  outline: none;
}

.ui-toast {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  column-gap: var(--size-3);
  background: var(--surface-1);
  border: var(--border-size-1) solid var(--border);
  border-radius: var(--radius-2);
  padding: var(--size-4);
  box-shadow: 0 5px 15px 3px rgba(0, 0, 0, 0.3);

  &.is-success {
    border-color: var(--green-6);
  }

  &.is-error {
    border-color: var(--error);
  }

  &[data-state='open'] {
    animation: toast-slide-in 0.2s var(--ease-3);
  }

  &[data-state='closed'] {
    animation: toast-fade-out 0.2s var(--ease-3);
  }

  &[data-swipe='move'] {
    transform: translateX(var(--reka-toast-swipe-move-x));
  }

  &[data-swipe='end'] {
    animation: toast-swipe-out 0.2s ease-out forwards;
  }
}

.ui-toast-title {
  font-weight: var(--font-weight-6);
  color: var(--text-1);
}

.ui-toast-description {
  grid-column: 1 / -1;
  color: var(--text-2);
  font-size: var(--font-size-0);
}

.ui-toast-close {
  color: var(--text-2);
  font-size: var(--font-size-3);
  line-height: 1;
}

@keyframes toast-slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-fade-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

@keyframes toast-swipe-out {
  from {
    transform: translateX(var(--reka-toast-swipe-end-x));
  }
  to {
    transform: translateX(100%);
  }
}
</style>
