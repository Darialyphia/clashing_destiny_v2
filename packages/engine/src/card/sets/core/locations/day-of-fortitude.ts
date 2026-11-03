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
import { isDefined } from '@game/shared';
import { DefenderModifier } from '../../../../modifier/modifiers/defender.modifier';

export const dayOfFortitude: LocationBlueprint = {
  id: 'day-of-fortitude',
  kind: CARD_KINDS.LOCATION,
  collectable: true,
  name: 'Day of Fortitude',
  description: dedent /*html*/ `
    Minions at this battlefield have <rt-keyword>Defender 1</rt-keyword>.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<LocationCard>('day-of-fortitude', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return card
                .battlefield!.allSpaces.map(space => space.card)
                .filter(isDefined)
                .some(c => c.equals(candidate));
            },
            getModifiers() {
              return [new DefenderModifier(game, card, { amount: 1 })];
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
