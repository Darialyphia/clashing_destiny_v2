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
import { SimpleCommandmentBuffModifier } from '../../../../modifier/modifiers/simple-commandment-modifier';

export const forgottenMarsh: DestinyBlueprint = {
  id: 'austerity',
  kind: CARD_KINDS.DESTINY,
  collectable: true,
  name: 'Forgotten Marsh',
  description: dedent /*html*/ `
    Minions at this battlefield have -2/+0/+0.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  art: defaultCardArt('destinies/forgotten-marsh'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<DestinyCard>('forgotten-marsh', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return card
                .battlefield!.allSpaces.map(space => space.card)
                .filter(isDefined)
                .some(c => c.equals(candidate));
            },
            getModifiers() {
              return [
                new SimpleCommandmentBuffModifier('forgotten-marsh-aura', game, card, {
                  amount: -2
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
