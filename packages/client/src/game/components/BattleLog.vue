<script setup lang="ts">
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useBattleLog } from '../composables/useBattleLog';
import UiDrawer from '@/ui/components/UiDrawer.vue';
import FancyButton from '@/ui/components/FancyButton.vue';

const events = useBattleLog();
const listEl = ref<HTMLElement>();

watch(
  () => events.value.length,
  () => {
    nextTick(() => {
      listEl.value?.scrollTo({
        top: listEl.value.scrollHeight,
        behavior: 'smooth'
      });
    });
  }
);

const isOpened = ref(false);
watch(isOpened, opened => {
  if (opened) {
    nextTick(() => {
      listEl.value?.scrollTo({
        top: listEl.value.scrollHeight,
        behavior: 'instant'
      });
    });
  }
});
</script>

<template>
  <FancyButton text="Battle Log" @click="isOpened = true" />

  <UiDrawer
    v-model:is-opened="isOpened"
    title="Battle Log"
    description="Recap of actions taken"
    position="left"
  >
    <ul ref="listEl" class="combat-log fancy-scrollbar surface">
      <li v-for="(event, index) in events" :key="index">
        <span
          v-for="(token, tokenIndex) in event"
          :key="tokenIndex"
          class="token"
          :class="token.kind"
        >
          <template v-if="token.kind === 'text'">{{ token.text }}</template>

          <template v-else-if="token.kind === 'card'">
            <InspectableCard
              class="battle-log-card"
              :card-id="token.card.id"
              side="right"
              :side-offset="50"
              :close-delay="0"
              :open-delay="0"
            >
              <span class="card">{{ token.card.name }}</span>
            </InspectableCard>
          </template>

          <template v-else-if="token.kind === 'player'">
            {{ token.player.name }}
          </template>

          <template v-else-if="token.kind === 'game-turn-start'">
            Turn {{ token.turn }}.
          </template>
          <template v-else-if="token.kind === 'game-phase-change'">
            {{ token.phase.replace('_', ' ') }}
          </template>
        </span>
      </li>
    </ul>
  </UiDrawer>
</template>

<style scoped lang="postcss">
.combat-log {
  overflow-y: auto;
  font-size: var(--font-size-2);
  height: 100%;
}

li {
  white-space: pre-wrap;
  padding: var(--size-1) var(--size-3) var(--size-2);
  margin-block: var(--size-2);
  color: #d1b07d;
  border-bottom: solid 1px hsl(from #73473a h s l / 0.7);
  > * {
    display: inline;
  }
}

.token {
  &::after {
    content: ' ';
    display: inline-block;
    width: 0.5ch;
  }
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
  display: block;
  text-transform: capitalize;
  width: 100%;
  font-size: var(--font-size-2);
  text-align: center;
}
.game-turn-start {
  flex-grow: 1;
  display: block;
  font-weight: var(--font-weight-8);
  width: 100%;
  text-align: center;
  background: linear-gradient(to right, transparent, #73473a, transparent);
  font-size: var(--font-size-4);
}

:deep(.battle-log-card) {
  display: inline;
}
</style>
