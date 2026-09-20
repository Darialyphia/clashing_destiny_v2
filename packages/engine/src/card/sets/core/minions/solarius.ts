import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { GAME_EVENTS } from '../../../../game/game.events';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { MinionCard } from '../../../entities/minion.entity';
import { EmpoweredModifier } from '../../../../modifier/modifiers/empowered.modifier';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { VigilantModifier } from '../../../../modifier/modifiers/vigilant.modifier';
import { CardEffectTriggeredEvent } from '../../../card.events';

export const solarius: MinionBlueprint = {
  id: 'solarius',
  name: 'Solarius',
  description: dedent /*html*/ `
  When you win at a battlefield with at least 3 more points than your opponent, <rt-keyword>Empower</rt-keyword> this.
  While this is <rt-keyword>Empowered</rt-keyword>, this has +1/+2/+2 and <rt-keyword>Vigilant</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/solarius'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT, AFFINITIES.NEUTRAL],
  manaCost: 4,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>('solarius-empower', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.BATTLEFIELD_SCORED,
            filter(event) {
              if (card.modifiers.has(EmpoweredModifier)) return false;
              return (
                event.data.winner.player.equals(card.player) &&
                event.data.winner.score - event.data.loser.score >= 3
              );
            },
            async handler() {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: 'Solarius becomes empowered'
                })
              );
              await card.modifiers.add(new EmpoweredModifier(game, card));
            }
          })
        ]
      })
    );

    await card.modifiers.add(
      new SimpleStatsBuffModifier('solarius-stats-buff', game, card, {
        atk: 1,
        cmd: 2,
        hp: 2,
        mixins: [
          new TogglableModifierMixin(game, () => card.modifiers.has(EmpoweredModifier))
        ]
      })
    );

    await card.modifiers.add(
      new VigilantModifier(game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.modifiers.has(EmpoweredModifier))
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
