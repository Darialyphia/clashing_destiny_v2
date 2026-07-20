import dedent from 'dedent';
import type { DestinyBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import type { DestinyCard } from '../../../entities/destiny.entity';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { isDefined } from '@game/shared';
import { OnScoreModifier } from '../../../../modifier/modifiers/on-score.modifier';
import type { MinionCard } from '../../../entities/minion.entity';
import { AbilityDamage } from '../../../../utils/damage';
import { CardEffectTriggeredEvent } from '../../../card.events';
import { GAME_EVENTS } from '../../../../game/game.events';
import { discardFromHand } from '../../../card-actions-utils';

export const ashesOfPain: DestinyBlueprint = {
  id: 'ashes-of-pain',
  kind: CARD_KINDS.DESTINY,
  collectable: true,
  name: 'Ashes of Pain',
  description: dedent /*html*/ `
    Minions at this battlefield have <rt-trigger>On Score</rt-trigger>  Discard a card, then draw a card.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<DestinyCard>('ashes-of-pain', game, card, {
        mixins: [
          new CardAuraModifierMixin<MinionCard>(game, card, {
            isElligible(candidate) {
              return card.isOnSameBattlefieldAs(candidate);
            },
            getModifiers(candidate) {
              return [
                new OnScoreModifier(game, card, {
                  async handler() {
                    await game.emit(
                      GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                      new CardEffectTriggeredEvent({
                        card,
                        message: 'Ashes of Pain effect triggered'
                      })
                    );
                    if (card.player.cardManager.hand.length === 0) return;
                    await discardFromHand(game, card, { min: 1, max: 1 });
                    await card.player.cardManager.draw(1);
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
