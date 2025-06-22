<script setup lang="ts">
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useGameClient, useGameState } from '../composables/useGameClient';
import { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { Icon } from '@iconify/vue';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { vOnClickOutside } from '@vueuse/components';
import type { GamePhase } from '@game/engine/src/game/game.enums';
import { isDefined } from '@game/shared';

const state = useGameState();
const client = useGameClient();

onMounted(() => {
  client.value.onUpdateCompleted(snapshot => {
    snapshot.events.forEach(({ event, eventName }) => {
      const tokens: Token[] = [];

      if (eventName === GAME_EVENTS.GAME_TURN_START) {
        tokens.push({
          kind: 'game-turn-start',
          turn: event.turnCount
        });
      }

      if (eventName === GAME_EVENTS.PLAYER_START_TURN) {
        tokens.push({
          kind: 'player-turn_start',
          player: state.value.entities[event.player.id] as PlayerViewModel
        });
      }

      if (eventName === GAME_EVENTS.AFTER_CHANGE_PHASE) {
        tokens.push({
          kind: 'game-phase-change',
          phase: event.to.state as GamePhase
        });
      }

      if (eventName === GAME_EVENTS.CARD_AFTER_PLAY) {
        tokens.push({
          kind: 'text',
          text: `${state.value.entities[event.card.player].name} played`
        });
        tokens.push({
          kind: 'card',
          card: state.value.entities[event.card.id] as CardViewModel
        });
      }

      if (eventName === GAME_EVENTS.AFTER_DECLARE_ATTACK_TARGET) {
        tokens.push({
          kind: 'card',
          card: state.value.entities[event.attacker] as CardViewModel
        });
        tokens.push({
          kind: 'text',
          text: 'declared an attack on'
        });
        tokens.push({
          kind: 'card',
          card: state.value.entities[event.target] as CardViewModel
        });
      }

      if (eventName === GAME_EVENTS.AFTER_DECLARE_BLOCKER) {
        if (isDefined(event.blocker)) {
          tokens.push({
            kind: 'card',
            card: state.value.entities[event.blocker] as CardViewModel
          });
          tokens.push({
            kind: 'text',
            text: 'declared a block.'
          });
        } else {
          tokens.push({
            kind: 'text',
            text: 'No blocker declared.'
          });
        }
      }

      if (eventName === GAME_EVENTS.HERO_BEFORE_DEAL_COMBAT_DAMAGE) {
        tokens.push({
          kind: 'card',
          card: state.value.entities[event.card.id] as CardViewModel
        });
        tokens.push({
          kind: 'text',
          text: `dealt ${event.damage} combat damage to`
        });
        tokens.push({
          kind: 'card',
          card: state.value.entities[event.target] as CardViewModel
        });
      }

      if (eventName === GAME_EVENTS.MINION_BEFORE_DEAL_COMBAT_DAMAGE) {
        tokens.push({
          kind: 'card',
          card: state.value.entities[event.card.id] as CardViewModel
        });
        tokens.push({
          kind: 'text',
          text: `dealt ${event.damage} combat damage to`
        });
        tokens.push({
          kind: 'card',
          card: state.value.entities[event.target] as CardViewModel
        });
      }

      if (eventName === GAME_EVENTS.HERO_AFTER_TAKE_DAMAGE) {
        tokens.push({
          kind: 'card',
          card: state.value.entities[event.card.id] as CardViewModel
        });
        tokens.push({
          kind: 'text',
          text: `took ${event.damage.amount} ${event.damage.type} damage.`
        });
      }

      if (eventName === GAME_EVENTS.MINION_AFTER_TAKE_DAMAGE) {
        tokens.push({
          kind: 'card',
          card: state.value.entities[event.card.id] as CardViewModel
        });
        tokens.push({
          kind: 'text',
          text: `took ${event.damage.amount} ${event.damage.type} damage.`
        });
      }

      if (eventName === GAME_EVENTS.PLAYER_AFTER_DRAW) {
        tokens.push({
          kind: 'player',
          player: state.value.entities[event.player.id] as PlayerViewModel
        });
        tokens.push({
          kind: 'text',
          text: `draw ${event.amount} card${event.amount > 1 ? 's' : ''}.`
        });
      }

      if (tokens.length > 0) {
        events.value.push(tokens);
      }
    });
  });
});

type Token =
  | {
      kind: 'text';
      text: string;
    }
  | { kind: 'card'; card: CardViewModel }
  | {
      kind: 'player';
      player: PlayerViewModel;
    }
  | {
      kind: 'input';
      player: PlayerViewModel;
    }
  | { kind: 'game-turn-start'; turn: number }
  | { kind: 'game-phase-change'; phase: GamePhase }
  | { kind: 'player-turn_start'; player: PlayerViewModel }
  | { kind: 'action'; text: string };

const events = shallowRef<Token[][]>([[]]);

const isCollapsed = ref(true);

const listEl = ref<HTMLElement>();
watch(isCollapsed, collapsed => {
  if (!collapsed) {
    nextTick(() => {
      listEl.value?.scrollTo({
        top: listEl.value.scrollHeight,
        behavior: 'instant'
      });
    });
  }
});

watch(
  () => events.value.length,
  () => {
    if (isCollapsed.value) return;
    nextTick(() => {
      listEl.value?.scrollTo({
        top: listEl.value.scrollHeight,
        behavior: 'smooth'
      });
    });
  }
);

const close = () => {
  isCollapsed.value = true;
};

const isAction = (event: Pick<Token, 'kind'>[]) =>
  event.some(t => t.kind === 'action');
</script>

<template>
  <div
    v-on-click-outside="close"
    class="combat-log fancy-scrollbar surface"
    :class="isCollapsed && 'is-collapsed'"
  >
    <h4>Battle Log</h4>
    <ul v-if="!isCollapsed" ref="listEl" class="fancy-scrollbar">
      <li
        v-for="(event, index) in events"
        :key="index"
        :class="isAction(event) && 'action'"
      >
        <span
          v-for="(token, tokenIndex) in event"
          :key="tokenIndex"
          :class="token.kind"
        >
          <template v-if="token.kind === 'text'">{{ token.text }}</template>
          <template v-else-if="token.kind === 'action'">
            {{ token.text }}
          </template>
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
          <template v-else-if="token.kind === 'player-turn_start'">
            {{ token.player.name }}'s turn'
          </template>

          <template v-else-if="token.kind === 'game-turn-start'">
            TURN {{ token.turn }}
          </template>
          <template v-else-if="token.kind === 'game-phase-change'">
            {{ token.phase.replace('_', ' ') }}
          </template>
        </span>
      </li>
    </ul>
    <button class="toggle" @click="isCollapsed = !isCollapsed">
      <Icon icon="game-icons:scroll-unfurled" />
    </button>
  </div>
</template>

<style scoped lang="postcss">
.combat-log {
  position: fixed;
  top: 25%;

  pointer-events: auto;
  font-size: 16px;
  color: #efef9f;
  user-select: none;

  box-shadow: 3px 3px 0 black;

  display: grid;
  grid-template-rows: auto 1fr;

  width: 26rem;
  height: var(--size-15);
  z-index: 1;
  @screen lt-lg {
    width: 20rem;
    height: var(--size-13);
  }

  padding-inline: 0;

  line-height: 2;

  transition: transform 0.2s var(--ease-5);

  &.is-collapsed {
    transform: translateX(-100%);
    padding: var(--size-2);
  }

  > button {
    align-self: start;
    margin-inline-start: auto;
  }
}

h4 {
  padding-block-end: var(--size-4);
  padding-inline-start: var(--size-3);
}

ul {
  overflow-y: auto;
}
li {
  display: flex;
  flex-wrap: wrap;
  gap: 1ch;

  padding-block: var(--size-1);
  padding-inline-start: var(--size-6);

  &.action {
    background-color: hsl(0 0 100% / 0.05);
  }
}

.toggle {
  position: absolute;
  bottom: 60%;
  left: 100%;
  transform: translateY(-6px);

  width: var(--size-8);
  height: calc(var(--size-9) + var(--size-1) + 1px);
  padding: 0;

  display: grid;
  place-content: center;

  font-family: 'Press Start 2P';
  color: #efef9f;
  user-select: none;
  background-color: #32021b;
  border: solid 2px #efef9f;
  border-right-color: #d7ad42;
  border-bottom-color: #d7ad42;
  text-shadow: 0 4px 0px #4e3327;
  box-shadow: 3px 3px 0 black;

  border-left: none;
  /* eslint-disable-next-line vue-scoped-css/no-unused-selector */
  > svg {
    aspect-ratio: 1;
    width: var(--size-7);
  }

  @screen lt-lg {
    height: var(--size-9);
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
  color: var(--orange-6);
}

.card {
  color: var(--orange-6);
  z-index: 1;
}

.player-turn_start {
  flex-grow: 1;

  font-weight: var(--font-weight-6);
  text-align: center;

  background-color: hsl(0 0 100% / 0.2);

  li:has(&) {
    padding: 0;
  }
}

.game-phase-change {
  flex-grow: 1;

  font-weight: var(--font-weight-6);
  text-align: center;

  background-color: hsl(0 0 100% / 0.1);
  text-transform: capitalize;

  li:has(&) {
    padding: 0;
  }
}
.game-turn_start {
  flex-grow: 1;

  font-weight: var(--font-weight-8);
  text-align: center;

  background-color: hsl(0 0 100% / 0.5);

  li:has(&) {
    padding: 0;
  }
}
</style>
