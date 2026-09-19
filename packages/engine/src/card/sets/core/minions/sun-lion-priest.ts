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
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { MinionCard } from '../../../entities/minion.entity';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { CardEffectTriggeredEvent } from '../../../card.events';

export const sunlionPriest: MinionBlueprint = {
  id: 'sun-lion-priest',
  name: 'Sunlion Priest',
  description: dedent /*html*/ `
  <rt-timing>Once per turn</rt-timing> When a minion with <rt-keyword>Zeal</rt-keyword> is destroyed, summon a random <rt-keyword>Zeal</rt-keyword> minion that costs less from your deck in your base.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/war-exorcist'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
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
      new WhileOnBoardModifier<MinionCard>('sun-lion-priest', game, card, {
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

              const candidates = card.player.cardManager.mainDeck.cards
                .filter(isMinion)
                .filter(
                  c =>
                    c.modifiers.has(ZealModifier) && c.manaCost < event.data.card.manaCost
                );
              if (!candidates.length) return;
              const index = game.rngSystem.nextInt(candidates.length);
              const selectedCard = candidates[index];
              const availableSpaces = card.player.boardSide.base.filter(
                space => space.isEmpty
              );
              if (!availableSpaces.length) return;
              await selectedCard.playImmediatelyAt(availableSpaces[0], {
                shouldExhaust: false
              });
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
