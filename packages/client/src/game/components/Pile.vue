<script setup lang="ts">
const { size } = defineProps<{ size: number }>();
</script>

<template>
  <div class="pile">
    <div v-for="i in size" :key="i" class="pile-item" :style="{ '--i': i - 1 }">
      <slot :index="i - 1" />
    </div>

    <div class="count">{{ size }}</div>
  </div>
</template>

<style scoped lang="postcss">
.pile {
  display: grid;
  transform-style: preserve-3d;
  justify-self: center;
  position: relative;
  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.pile-item {
  background: url('/assets/ui/card-back-small.png') no-repeat;
  background-size: contain;
  transform: translateY(calc(var(--i) * -2.5px));
}

.count {
  position: absolute;
  bottom: 0%;
  right: 0;
  background: black;
  border-radius: 50%;
  width: var(--size-5);
  height: var(--size-5);
  display: grid;
  place-content: center;
  font-weight: bold;
  font-size: var(--font-size-1);
  color: #d7ad42;
  border: solid var(--border-size-1) #bb8225;
}
</style>
