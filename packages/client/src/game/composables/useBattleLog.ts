import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { GAME_PHASES, type GamePhase } from '@game/engine/src/game/game.enums';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { useGameState, useGameClient } from './useGameClient';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';

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
  | { kind: 'game-turn-start'; turn: number }
  | { kind: 'game-phase-change'; phase: GamePhase };

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
            turn: event.turnCount + 1
          });
        }

        if (eventName === GAME_EVENTS.CARD_BEFORE_PLAY) {
          tokens.push({
            kind: 'text',
            text: `${(state.value.entities[event.card.player] as PlayerViewModel).name} played`
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

        if (eventName === GAME_EVENTS.PLAYER_AFTER_DRAW) {
          tokens.push({
            kind: 'player',
            player: state.value.entities[event.player] as PlayerViewModel
          });
          tokens.push({
            kind: 'text',
            text: `draw ${event.amount} card${event.amount > 1 ? 's' : ''}.`
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

        if (eventName === GAME_EVENTS.AFTER_DECLARE_ATTACK_TARGET) {
          tokens.push({
            kind: 'card',
            card: state.value.entities[event.attacker] as CardViewModel
          });
          tokens.push({
            kind: 'text',
            text: `declared an attack on`
          });
          tokens.push({
            kind: 'card',
            card: state.value.entities[event.target] as CardViewModel
          });
        }

        if (eventName === GAME_EVENTS.AFTER_DEFENDER_STRIKES) {
          tokens.push({
            kind: 'card',
            card: state.value.entities[event.defender] as CardViewModel
          });
          tokens.push({
            kind: 'text',
            text: `Retaliates`
          });
        }

        if (eventName === GAME_EVENTS.AFTER_SCORE) {
          tokens.push({
            kind: 'card',
            card: state.value.entities[event.card] as CardViewModel
          });
          tokens.push({
            kind: 'text',
            text: `Scores`
          });
        }

        if (eventName === GAME_EVENTS.CARD_AFTER_DESTROY) {
          tokens.push({
            kind: 'card',
            card: state.value.entities[event.card] as CardViewModel
          });
          tokens.push({
            kind: 'text',
            text: `was destroyed.`
          });
        }

        if (eventName === GAME_EVENTS.CARD_EFFECT_TRIGGERED) {
          tokens.push({
            kind: 'text',
            text: event.message
          });
        }

        if (eventName === GAME_EVENTS.PLAYER_AFTER_ADD_SUPPLY) {
          tokens.push({
            kind: 'player',
            player: state.value.entities[event.player] as PlayerViewModel
          });
          tokens.push({
            kind: 'text',
            text: `put`
          });
          tokens.push({
            kind: 'card',
            card: state.value.entities[event.card] as CardViewModel
          });
          tokens.push({
            kind: 'text',
            text: `in the Supply Zone.`
          });
        }

        if (eventName === GAME_EVENTS.CARD_AFTER_MOVE) {
          tokens.push({
            kind: 'card',
            card: state.value.entities[event.card] as CardViewModel
          });

          tokens.push({
            kind: 'text',
            text: `moved from ${event.from.position.zone} to ${event.to.position.zone}.`
          });
        }

        if (eventName === GAME_EVENTS.AFTER_CHANGE_PHASE) {
          if (
            event.to.state !== GAME_PHASES.PLAY_CARD &&
            event.from !== GAME_PHASES.PLAY_CARD
          ) {
            tokens.push({
              kind: 'game-phase-change',
              phase: event.to.state
            });
          }
        }

        if (eventName === GAME_EVENTS.CARD_AFTER_CHANGE_LOCATION) {
          if (
            event.from === CARD_LOCATIONS.HAND &&
            event.to === CARD_LOCATIONS.DISCARD_PILE
          ) {
            const card = state.value.entities[event.card] as CardViewModel;
            tokens.push({
              kind: 'player',
              player: card.player
            });
            tokens.push({
              kind: 'text',
              text: `discarded.`
            });
            tokens.push({
              kind: 'card',
              card: state.value.entities[event.card] as CardViewModel
            });
          }
        }

        if (eventName === GAME_EVENTS.PLAYER_AFTER_GAIN_VICTORY_POINT) {
          tokens.push({
            kind: 'player',
            player: state.value.entities[event.player] as PlayerViewModel
          });
          tokens.push({
            kind: 'text',
            text: `gained a victory point (${event.total}/${state.value.config.VICTORY_POINTS_TO_WIN}).`
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
