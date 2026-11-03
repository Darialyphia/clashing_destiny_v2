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
import { StealthModifier } from '../../../../modifier/modifiers/stealth.modifier';
import { CardEffectTriggeredEvent } from '../../../card.events';

export const xaanUndercity: LocationBlueprint = {
  id: 'xaan-undercity',
  kind: CARD_KINDS.LOCATION,
  collectable: true,
  name: 'Xaan Undercity',
  description: dedent /*html*/ `
    The first minion that moves here each turn gains <rt-keyword>Stealth</rt-keyword>.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<LocationCard>('xaan-undercity', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_MOVE,
            frequencyPerGameTurn: 1,
            filter: event =>
              isMinion(event.data.card) && event.data.to.position.zone === card.location,
            async handler(event) {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: 'Xaan Undercity effect triggered'
                })
              );
              await event.data.card.modifiers.add(new StealthModifier(game, card));
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
