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
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import type { LocationCard } from '../../../entities/location.entity';
import type { MinionCard } from '../../../entities/minion.entity';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import { GAME_EVENTS } from '../../../../game/game.events';
import { CardEffectTriggeredEvent } from '../../../card.events';

export const crystalCaverns: LocationBlueprint = {
  id: 'crystal-caverns',
  kind: CARD_KINDS.LOCATION,
  collectable: true,
  name: 'Crystal Caverns',
  description: dedent /*html*/ `
    Minions here have <rt-trigger>On Destroyed</rt-trigger>: draw a card.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    // A destroyed minion is sent to the discard pile before CARD_AFTER_DESTROY is emitted,
    // which would make the aura remove On Destroyed before it can trigger.
    // Minions destroyed here keep the aura until their On Destroyed has resolved.
    const minionsBeingDestroyedHere = new Set<string>();

    await card.modifiers.add(
      new WhileOnBattlefieldModifier<LocationCard>('crystal-caverns', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_BEFORE_DESTROY,
            filter: event =>
              isMinion(event.data.card) && card.isOnSameBattlefieldAs(event.data.card),
            handler(event) {
              minionsBeingDestroyedHere.add(event.data.card.id);
            }
          }),
          new CardAuraModifierMixin<MinionCard>(game, card, {
            isElligible(candidate) {
              return (
                isMinion(candidate) &&
                (card.isOnSameBattlefieldAs(candidate) ||
                  minionsBeingDestroyedHere.has(candidate.id))
              );
            },
            getModifiers(candidate) {
              return [
                new OnDeathModifier<MinionCard>(game, card, {
                  async handler() {
                    minionsBeingDestroyedHere.delete(candidate.id);
                    await game.emit(
                      GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                      new CardEffectTriggeredEvent({
                        card,
                        message: 'Crystal Caverns effect triggered'
                      })
                    );
                    await candidate.player.cardManager.draw(1);
                  }
                })
              ];
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
