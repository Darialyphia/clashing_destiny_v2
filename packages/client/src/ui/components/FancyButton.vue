<script setup lang="ts">
import { RouterLink, type RouterLinkProps } from 'vue-router';

defineOptions({ inheritAttrs: false });

export type ButtonProps = {
  isLoading?: boolean;
  isInline?: boolean;
  to?: RouterLinkProps['to'];
  text: string;
  variant?: 'primary' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
};

const {
  isLoading = false,
  variant = 'primary',
  isInline,
  text,
  size = 'md',
  to
} = defineProps<ButtonProps>();

const attrs = useAttrs();

const tag = computed(() => {
  if (attrs.href) return 'a';
  if (to) return RouterLink;
  return 'button';
});
</script>

<template>
  <component
    :is="tag"
    :to="to"
    class="fancy-button"
    :class="[
      size,
      {
        'is-inline': isInline,
        'is-loading': isLoading
      },
      variant
    ]"
    :disabled="attrs.disabled || isLoading"
    v-bind="attrs"
  >
    <!-- <UiSpinner v-if="isLoading" /> -->
    <span class="content" :data-text="text">
      {{ text }}
    </span>
  </component>
</template>

<style scoped lang="postcss">
@import 'open-props/media';

@layer components {
  .fancy-button {
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-4);

    display: flex;
    gap: var(--size-2);
    align-items: center;
    justify-content: center;

    width: fit-content;
    padding: var(--size-2-em) var(--size-3-em);

    font-family: 'Cinzel Decorative', serif;
    font-weight: var(--font-weight-9);
    white-space: nowrap;
    position: relative;
    z-index: 0;

    border-image-slice: 38 fill;
    border-image-width: 38px;
    border-radius: var(--_ui-button-radius);

    transition: filter 0.2s var(--ease-2);
    &.primary {
      border-image-source: url('/assets/ui/button.png');
    }

    &.error {
      border-image-source: url('/assets/ui/button-error.png');
    }

    &.info {
      border-image-source: url('/assets/ui/button-blue.png');
    }

    &:disabled {
      border-image-source: url('/assets/ui/button-disabled.png');
      cursor: not-allowed;
    }

    &,
    &:hover {
      text-decoration: none;
    }

    &.is-inline {
      display: inline-flex;
    }

    & > .icon {
      display: block;
      flex-shrink: 0;
      aspect-ratio: 1;
      font-size: var(--font-size-4);
    }

    &:hover:not(:disabled) {
      color: var(--_ui-button-hover-color);
      filter: brightness(1.5);
    }
    &.sm {
      font-size: var(--font-size-1);
    }
    &.lg {
      font-size: var(--font-size-5);
    }
  }

  .content {
    position: relative;
    color: transparent;
    &::before,
    &::after {
      position: absolute;
      content: attr(data-text);
      color: transparent;
      inset: 0;
    }
    &:after {
      background-clip: text;
    }
    .primary &::after {
      background-image: linear-gradient(#efef9f, #efef9f 50%, #d7ad42 50%);
    }

    .error &::after {
      background-image: linear-gradient(#fcfcfc, #fcfcfc 50%, #ff9da3 50%);
    }

    .info &::after {
      background-image: linear-gradient(#fcfcfc, #fcfcfc 50%, #c7fffc 50%);
    }
    &:before {
      -webkit-text-stroke: 2px hsl(0 0% 0% / 0.75);
      paint-order: stroke fill;
      z-index: -1;
    }
  }
}
</style>
