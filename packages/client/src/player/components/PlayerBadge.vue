<script setup lang="ts">
import { assets } from '@/assets';

const { name } = defineProps<{
  name: string;
}>();
</script>

<template>
  <div class="user-badge">
    <img class="avatar" :src="assets['avatars/erina'].path" alt="User Avatar" />
    <div>
      <div class="name dual-text" :data-text="name">{{ name }}</div>
      <slot />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.user-badge {
  z-index: 0;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  border-top-right-radius: var(--radius-pill);
  border-bottom-right-radius: var(--radius-pill);
  position: relative;
  overflow: hidden;
  padding-right: var(--size-4);
  background: linear-gradient(to right, transparent, 45px, #000000aa 45px);
}

.name {
  font-weight: 600;
  font-size: var(--font-size-4);
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(99, 102, 241, 0.3);
  letter-spacing: 0.5px;
}

.avatar {
  width: 94px;
  aspect-ratio: 1;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(99, 102, 241, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  transform: translateX(2px);
}
</style>
