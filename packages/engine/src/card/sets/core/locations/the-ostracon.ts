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
import { CardEffectTriggeredEvent } from '../../../card.events';

export const theOstracon: LocationBlueprint = {
  id: 'the-ostracon',
  kind: CARD_KINDS.LOCATION,
  collectable: true,
  name: 'The Ostracon',
  description: dedent /*html*/ `
    When a minion scores here, destroy it.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<LocationCard>('the-ostracon', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.AFTER_SCORE,
            filter: event =>
              isMinion(event.data.card) &&
              event.data.card.isAlive &&
              event.data.locationCard.equals(card),
            async handler(event) {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: 'The Ostracon effect triggered'
                })
              );
              await event.data.card.destroy(card);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
