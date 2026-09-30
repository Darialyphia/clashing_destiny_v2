import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { AbilityDamage } from '../../../../utils/damage';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import type { MinionCard } from '../../../entities/minion.entity';
import { CardEffectTriggeredEvent } from '../../../card.events';

export const redSynja: MinionBlueprint = {
  id: 'red-synja',
  name: 'Red Synja',
  description: dedent /*html*/ `
  <rt-location locations="battlefield"></rt-location> When an enemy scores here, deal 3 damage to it.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/red-synja'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  affinities: [
    AFFINITIES.NEUTRAL,
    AFFINITIES.NEUTRAL,
    AFFINITIES.NEUTRAL,
    AFFINITIES.NEUTRAL
  ],
  manaCost: 6,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 5,
  maxHp: 6,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>('red-synja', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.AFTER_SCORE,
            filter: event =>
              isMinion(event.data.card) &&
              event.data.card.isEnemy(card) &&
              event.data.card.location === card.location,
            async handler(event) {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: 'Red Synja effect triggered!'
                })
              );
              await (event.data.card as MinionCard).takeDamage(
                card,
                new AbilityDamage(3)
              );
            }
          })
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
