<script setup lang="ts">
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useGameClient, useGameState } from '../composables/useGameClient';
import { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import type { GamePhase } from '@game/engine/src/game/game.enums';
import { DAMAGE_TYPES } from '@game/engine/src/utils/damage';

const state = useGameState();
const client = useGameClient();

onMounted(() => {
  client.value.onUpdateCompleted(snapshot => {
    snapshot.events.forEach(({ event, eventName }) => {
      const tokens: Token[] = [];
      if (eventName === GAME_EVENTS.TURN_START) {
        tokens.push({
          kind: 'game-turn-start',
          turn: event.turnCount
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

      if (eventName === GAME_EVENTS.ABILITY_AFTER_USE) {
        tokens.push({
          kind: 'card',
          card: state.value.entities[event.card] as CardViewModel
        });
        tokens.push({
          kind: 'text',
          text: `Used an ability`
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

      if (
        eventName === GAME_EVENTS.HERO_AFTER_TAKE_DAMAGE &&
        event.damage.amount &&
        event.damage.type === DAMAGE_TYPES.COMBAT
      ) {
        tokens.push({
          kind: 'card',
          card: state.value.entities[event.card.id] as CardViewModel
        });
        tokens.push({
          kind: 'text',
          text: `took ${event.damage.amount}  damage.`
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

      if (eventName === GAME_EVENTS.EFFECT_CHAIN_PLAYER_PASSED) {
        tokens.push({
          kind: 'player',
          player: state.value.entities[event.player] as PlayerViewModel
        });
        tokens.push({
          kind: 'text',
          text: `passed chain priority`
        });
      }

      if (eventName === GAME_EVENTS.EFFECT_CHAIN_BEFORE_EFFECT_RESOLVED) {
        tokens.push({
          kind: 'text',
          text: `Resolving Effect chain step ${event.index + 1}`
        });
      }

      if (eventName === GAME_EVENTS.EFFECT_CHAIN_AFTER_EFFECT_RESOLVED) {
        tokens.push({
          kind: 'text',
          text: `Effect chain step ${event.index + 1} has been resolved`
        });
      }

      if (eventName === GAME_EVENTS.EFFECT_CHAIN_EFFECT_ADDED) {
        tokens.push({
          kind: 'player',
          player: state.value.entities[event.player] as PlayerViewModel
        });
        tokens.push({
          kind: 'text',
          text: `added an effect to the chain at step ${event.index + 1}`
        });
      }

      if (eventName === GAME_EVENTS.EFFECT_CHAIN_RESOLVED) {
        tokens.push({
          kind: 'text',
          text: `The effect chain has been resolved`
        });
      }

      if (eventName === GAME_EVENTS.TURN_INITATIVE_CHANGE) {
        tokens.push({
          kind: 'text',
          text: `Initiative switched to`
        });
        tokens.push({
          kind: 'player',
          player: state.value.entities[
            event.newInitiativePlayer
          ] as PlayerViewModel
        });
      }

      if (eventName === GAME_EVENTS.TURN_PASS) {
        tokens.push({
          kind: 'player',
          player: state.value.entities[event.player] as PlayerViewModel
        });
        tokens.push({
          kind: 'text',
          text: `passed initiative.`
        });
      }

      if (tokens.length > 0) {
        tokens.push({ kind: 'text', text: '.' });
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
  | { kind: 'player-turn_start'; player: PlayerViewModel };

const events = ref<Token[][]>([[{ kind: 'text', text: 'Game started.' }]]);

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
</template>

<style scoped lang="postcss">
.combat-log {
  height: 90%;
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
