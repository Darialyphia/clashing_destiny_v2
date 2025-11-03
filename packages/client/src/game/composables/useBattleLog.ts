import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import type { GamePhase } from '@game/engine/src/game/game.enums';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { DAMAGE_TYPES } from '@game/engine/src/utils/damage';
import { useGameState, useGameClient } from './useGameClient';

type BattleLogEventToken =
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

export type BattleLogEvents = BattleLogEventToken[][];

export const useBattleLog = () => {
  const state = useGameState();
  const { client } = useGameClient();

  onMounted(() => {
    client.value.onUpdateCompleted(snapshot => {
      snapshot.events.forEach(({ event, eventName }) => {
        const tokens: BattleLogEventToken[] = [];
        if (eventName === GAME_EVENTS.TURN_START) {
          tokens.push({
            kind: 'game-turn-start',
            turn: event.turnCount
          });
        }

        if (eventName === GAME_EVENTS.CARD_BEFORE_PLAY) {
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
            card: state.value.entities[event.card] as CardViewModel
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
            card: state.value.entities[event.card] as CardViewModel
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
            card: state.value.entities[event.card] as CardViewModel
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

        if (eventName === GAME_EVENTS.EFFECT_CHAIN_AFTER_RESOLVED) {
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

        if (eventName === GAME_EVENTS.CARD_EFFECT_TRIGGERED) {
          tokens.push({
            kind: 'text',
            text: event.message
          });
        }

        if (tokens.length > 0) {
          events.value.push(tokens);
        }
      });
    });
  });

  const events = ref<BattleLogEvents>([
    [{ kind: 'text', text: 'Game started' }]
  ]);

  return events as Ref<BattleLogEvents>;
};
