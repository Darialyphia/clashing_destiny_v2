import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { GAME_EVENTS } from '../../../../game/game.events';
import { defaultCardArt, isMinion } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import {
  WhileOnBaseModifier,
  WhileOnBoardModifier
} from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { MinionCard } from '../../../entities/minion.entity';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { CardEffectTriggeredEvent } from '../../../card.events';

export const sunlionPriest: MinionBlueprint = {
  id: 'sun-lion-priest',
  name: 'Sunlion Priest',
  description: dedent /*html*/ `
  <rt-location locations="base"></rt-location> When a minion with <rt-keyword>Zeal</rt-keyword> is destroyed, draw a card.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/war-exorcist'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT, AFFINITIES.NEUTRAL],
  manaCost: 5,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBaseModifier<MinionCard>('sun-lion-priest', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_DESTROY,
            frequencyPerGameTurn: 1,
            filter(event) {
              return (
                event.data.card.isAlly(card) &&
                isMinion(event.data.card) &&
                event.data.card.modifiers.has(ZealModifier)
              );
            },
            async handler(event) {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: 'Sunlion Priest effect triggered'
                })
              );

              await card.player.cardManager.draw(1);
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
