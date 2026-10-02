<script setup lang="ts">
const { title } = defineProps<{
  title: string;
}>();
</script>

<template>
  <h1 class="dual-text" :data-text="title" style="--dual-text-stroke: 2px">
    {{ title }}
  </h1>

  <div class="title-divider" aria-hidden="true">
    <span class="diamond"></span>
  </div>
</template>

<style lang="postcss" scoped>
h1 {
  font-size: var(--font-size-7);
  font-weight: var(--font-weight-7);
  color: var(--text-1);
  margin-bottom: var(--size-1);
  font-family: 'Cinzel Decorative', serif;
  text-align: center;
  @screen lt-lg {
    font-size: var(--font-size-6);
  }
}

.title-divider {
  display: flex;
  align-items: center;
  gap: var(--size-3);
  width: min(30rem, 80%);
  margin: 0 auto var(--size-4);
  filter: drop-shadow(0 1px 0px black) drop-shadow(0 -1px 0px black)
    drop-shadow(-1px 0 0 #0006) drop-shadow(1px 0 0 #0006);

  &::before,
  &::after {
    content: '';
    height: 1px;
    flex: 1;
  }

  &::before {
    background: linear-gradient(to right, transparent, #d1b07d);
  }

  &::after {
    background: linear-gradient(to left, transparent, #d1b07d);
  }

  .diamond {
    width: 7px;
    height: 7px;
    flex: 0 0 7px;
    background: var(--primary);
    transform: rotate(45deg);
  }
}
</style>
