<script setup lang="ts">
import GameCard from './GameCard.vue';
import { useGameUi } from '../composables/useGameClient';
import { getKeywordById } from '@game/engine/src/card/card-keywords';
import { isDefined } from '@game/shared';

const ui = useGameUi();

const keywords = computed(() => {
  if (!ui.value.hoveredCard) return [];

  return ui.value.hoveredCard.keywords
    .map(keywordId => getKeywordById(keywordId))
    .filter(isDefined);
});
</script>

<template>
  <div class="hovered-card-infos">
    <Transition appear>
      <div v-if="ui.hoveredCard" class="hovered-card">
        <GameCard :card-id="ui.hoveredCard.id" :is-interactive="false" />
        <ul>
          <li v-for="keyword in keywords" :key="keyword.id">
            <div class="keyword-name">{{ keyword.name }}</div>
            {{ keyword.description }}
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="postcss">
.hovered-card-infos {
  color: white;
  font-size: 12px;
  border-radius: 4px;
}

.hovered-card {
  &.v-enter-active,
  &.v-leave-active {
    transition: all 0.3s var(--ease-3);
  }

  &.v-enter-from,
  &.v-leave-to {
    translate: var(--size-8) 0;
    opacity: 0;
  }
}

ul {
  margin-top: var(--size-2);
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
}
li {
  max-inline-size: calc(var(--card-width) * var(--pixel-scale));
  background-color: hsla(0, 0%, 0%, 0.8);
  color: #efef9f;
  padding: var(--size-1) var(--size-3);
  font-family: var(--font-system-ui);
  font-size: 14px;
  border: solid 1px #bb8225;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.keyword-name {
  font-weight: var(--font-weight-7);
  margin-bottom: var(--size-1);
}
</style>
