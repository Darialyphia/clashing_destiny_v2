import dedent from 'dedent';
import type { LocationBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';
import type { LocationCard } from '../../../entities/location.entity';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';
import { CardEffectTriggeredEvent } from '../../../card.events';

export const agenorsPass: LocationBlueprint = {
  id: 'agenors-pass',
  kind: CARD_KINDS.LOCATION,
  collectable: true,
  name: "Agenor's Pass",
  description: dedent /*html*/ `
    When a minion scores here, give it +0/+1/+1.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<LocationCard>('agenors-pass', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.AFTER_SCORE,
            filter: event =>
              isMinion(event.data.card) && event.data.locationCard.equals(card),
            async handler(event) {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: "Agenor's Pass effect triggered"
                })
              );
              await event.data.card.modifiers.add(
                new SimpleStatsBuffModifier('agenors-pass-buff', game, card, {
                  cmd: 0,
                  atk: 1,
                  hp: 1
                })
              );
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
