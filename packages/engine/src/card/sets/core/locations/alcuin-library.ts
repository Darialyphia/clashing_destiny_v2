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
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import type { LocationCard } from '../../../entities/location.entity';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { OnScoreModifier } from '../../../../modifier/modifiers/on-score.modifier';
import type { MinionCard } from '../../../entities/minion.entity';
import { CardEffectTriggeredEvent } from '../../../card.events';
import { GAME_EVENTS } from '../../../../game/game.events';
import { discardFromHand } from '../../../card-actions-utils';

export const alcuinLibrary: LocationBlueprint = {
  id: 'fleeting-thought',
  kind: CARD_KINDS.LOCATION,
  collectable: true,
  name: 'Alcuin Library',
  description: dedent /*html*/ `
    Minions at this battlefield have <rt-trigger>On Score</rt-trigger>  Discard a card, then draw a card.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('destinies/alcuin-library'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<LocationCard>('alcuin-library', game, card, {
        mixins: [
          new CardAuraModifierMixin<MinionCard>(game, card, {
            isElligible(candidate) {
              return card.isOnSameBattlefieldAs(candidate);
            },
            getModifiers() {
              return [
                new OnScoreModifier(game, card, {
                  async handler(event) {
                    await game.emit(
                      GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                      new CardEffectTriggeredEvent({
                        card,
                        message: 'Fleeting Thoughts effect triggered'
                      })
                    );
                    if (event.data.card.player.cardManager.hand.length === 0) return;
                    await discardFromHand(game, event.data.card, { min: 1, max: 1 });
                    await event.data.card.player.cardManager.draw(1);
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
