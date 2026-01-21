<script setup lang="ts">
import { assets } from '@/assets';

const { name } = defineProps<{
  name: string;
}>();
</script>

<template>
  <div class="user-badge">
    <span class="name dual-text" :data-text="name">{{ name }}</span>

    <img
      class="avatar"
      :src="assets['avatars/erina-lv3'].path"
      alt="User Avatar"
    />
  </div>
</template>

<style scoped lang="postcss">
.dual-text {
  color: transparent;
  position: relative;
  --_top-color: var(--top-color, #fcfcfc);
  --_bottom-color: var(--bottom-color, #ffb270);
  &::before,
  &::after {
    position: absolute;
    content: attr(data-text);
    color: transparent;
    inset: 0;
  }
  &:after {
    background: linear-gradient(
      var(--_top-color),
      var(--_top-color) 50%,
      var(--_bottom-color) 50%
    );
    line-height: 1.2;
    background-clip: text;
    background-size: 100% 1lh;
    background-repeat: repeat-y;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
  &:before {
    -webkit-text-stroke: calc(2px * var(--pixel-scale))
      var(--dual-text-stroke, black);
    z-index: -1;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: var(--size-2) var(--size-4);
  background: radial-gradient(
    circle at top left,
    hsl(230 20% 15%),
    hsl(230 50% 8%) 75%
  );
  border: 2px solid #9f938f;
  border-radius: 48px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 20px rgba(99, 102, 241, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.name {
  font-weight: 600;
  font-size: var(--font-size-2);
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(99, 102, 241, 0.3);
  letter-spacing: 0.5px;
}

.avatar {
  width: 48px;
  aspect-ratio: 1;
  border-radius: 50%;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(99, 102, 241, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}
</style>
