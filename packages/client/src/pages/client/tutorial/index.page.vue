<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { missions } from './missions';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';

definePage({
  name: 'TutorialHome'
});
</script>
<template>
  <div class="page">
    <AuthenticatedHeader />
    <section class="surface">
      <h1 class="dual-text" data-text="How to play">How to play</h1>
      <div class="divider" />
      <h2 class="dual-text" data-text="Rule book">Rule book</h2>
      <p>
        For a comprehensive guide on how to play the game, please refer to our
        <RouterLink
          :to="{ name: 'HowToPlay' }"
          class="c-primary underline font-bold"
        >
          How To Play
        </RouterLink>
        section.
      </p>

      <h2 class="dual-text" data-text="Tutorial Missions">Tutorial Missions</h2>
      <ul>
        <li v-for="mission in missions" :key="mission.id">
          <RouterLink
            :to="{ name: 'TutorialMission', params: { id: mission.id } }"
          >
            {{ mission.name }}
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="postcss">
.page {
  min-height: 100dvh;
  background: linear-gradient(to bottom, var(--surface-1), var(--surface-2));
}

section {
  max-width: fit-content;
  margin: var(--size-6) auto;
  padding: var(--size-8);
  box-shadow: var(--shadow-4);
}

.dual-text {
  color: transparent;
  position: relative;
  --_top-color: var(--top-color, #efef9f);
  --_bottom-color: var(--bottom-color, #d7ad42);
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
    -webkit-text-stroke: calc(2px * var(--pixel-scale)) black;
    z-index: -1;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
}

h1 {
  font-size: var(--font-size-7);
  font-weight: var(--font-weight-8);
  margin-block-end: var(--size-2);
  text-align: center;
  color: var(--text-1);
  font-family: 'Cinzel Decorative', serif;
  letter-spacing: 0.02em;
  position: relative;
}

h2 {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);
  margin-block-start: var(--size-6);
  margin-block-end: var(--size-3);
  color: var(--accent-9);
  font-family: 'Cinzel Decorative', serif;
}

p {
  font-size: var(--font-size-2);
  line-height: 1.6;
  color: var(--text-2);

  :deep(a) {
    color: var(--accent-10);
    font-weight: var(--font-weight-6);
    text-decoration: none;
    border-bottom: 2px solid transparent;
    transition: border-color 0.2s ease;

    &:hover {
      border-bottom-color: var(--accent-8);
    }
  }
}

ul {
  margin-block: var(--size-4);
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--size-2);

  li {
    position: relative;

    &:hover::before {
      transform: translateX(4px);
    }
  }

  li > * {
    display: block;
    font-weight: var(--font-weight-5);
    padding: var(--size-3) var(--size-4);
    padding-inline-start: var(--size-8);
    border-radius: var(--radius-2);
    text-decoration: none;
    color: var(--text-1);
    background: var(--surface-2);
    border: 1px solid var(--surface-3);
    transition: all 0.2s ease;

    &:hover {
      background: var(--surface-3);
      border-color: var(--accent-6);
      box-shadow: var(--shadow-2);
      transform: translateX(4px);
    }
  }
}
</style>
