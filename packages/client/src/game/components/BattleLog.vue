<script setup lang="ts">
import InspectableCard from '@/card/components/InspectableCard.vue';
import type { BattleLogEvents } from '../composables/useBattleLog';

const { events } = defineProps<{
  events: BattleLogEvents;
}>();

const listEl = ref<HTMLElement>();

watch(
  () => events.length,
  () => {
    nextTick(() => {
      listEl.value?.scrollTo({
        top: listEl.value.scrollHeight,
        behavior: 'smooth'
      });
    });
  }
);
</script>

<template>
  <ul ref="listEl" class="combat-log fancy-scrollbar">
    <li v-for="(event, index) in events" :key="index">
      <span
        v-for="(token, tokenIndex) in event"
        :key="tokenIndex"
        :class="token.kind"
      >
        <template v-if="token.kind === 'text'">{{ token.text }}</template>

        <template v-else-if="token.kind === 'card'">
          <InspectableCard
            :card-id="token.card.id"
            side="right"
            :side-offset="50"
            :close-delay="0"
            :open-delay="0"
          >
            <span class="card">{{ token.card.name }}</span>
          </InspectableCard>
        </template>

        <template v-else-if="token.kind === 'input'">
          {{ token.player.name }}
        </template>

        <template v-else-if="token.kind === 'player'">
          {{ token.player.name }}
        </template>

        <template v-else-if="token.kind === 'game-turn-start'">
          Turn {{ token.turn }} starts.
        </template>
        <template v-else-if="token.kind === 'game-phase-change'">
          {{ token.phase.replace('_', ' ') }}
        </template>
      </span>
    </li>
  </ul>
</template>

<style scoped lang="postcss">
.combat-log {
  overflow-y: auto;
  background-color: black;
  font-size: var(--font-size-0);
  color: #985e25;
  padding-block: var(--size-1);
}

li {
  display: flex;
  flex-wrap: wrap;
  gap: 1ch;
  line-height: 1.2;
  padding-inline: var(--size-3);
}

.player,
.unit,
.input,
.card,
.position {
  font-weight: var(--font-weight-7);
}

.input {
  color: var(--cyan-5);

  li:has(&) {
    padding-inline-start: var(--size-3);
  }
}

.unit {
  color: var(--blue-6);
}

.card {
  color: var(--blue-6);
  z-index: 1;
}

.player-turn_start {
  flex-grow: 1;

  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  text-align: center;

  background-color: hsl(0 0 100% / 0.2);
  padding-block: var(--size-2);

  li:has(&) {
    padding: 0;
  }
}

.game-phase-change {
  flex-grow: 1;
  color: #efef9f;
  text-transform: capitalize;
}
.game-turn_start {
  flex-grow: 1;

  font-weight: var(--font-weight-8);
}
</style>
