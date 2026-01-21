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
      var(--_top-color) 70%,
      var(--_bottom-color) 70%
    );
    line-height: 1.2;
    background-clip: text;
    background-size: 100% 1lh;
    background-repeat: repeat-y;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
  &:before {
    -webkit-text-stroke: calc(1px * var(--pixel-scale))
      var(--dual-text-stroke, black);
    z-index: -1;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
}

.user-badge {
  z-index: 0;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding-left: var(--size-3);
  background: radial-gradient(
    circle at top left,
    hsl(210 20% 15%),
    hsl(210 50% 8%) 75%
  );
  border: 1px solid #9f938f;
  border-radius: var(--radius-pill);
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
  transform: translateX(2px);
}
</style>
