import dedent from 'dedent';
import type { LocationBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
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

export const whistlingWoods: LocationBlueprint = {
  id: 'whistling-woods',
  kind: CARD_KINDS.LOCATION,
  collectable: true,
  name: 'Whistling Woods',
  description: dedent /*html*/ `
    When a minion attacks here, move it to your base after combat.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<LocationCard>('whistling-woods', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.AFTER_RESOLVE_COMBAT,
            filter: event =>
              event.data.attacker.isAlive &&
              event.data.attacker.location === card.location,
            async handler(event) {
              const attacker = event.data.attacker;
              const emptySpaceInBase = attacker.player.boardSide.base.find(
                space => space.isEmpty
              );
              if (!emptySpaceInBase) return;

              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: 'Whistling Woods effect triggered'
                })
              );
              await attacker.moveToSpace(emptySpaceInBase);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
