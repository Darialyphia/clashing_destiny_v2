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
import { RootedModifier } from '../../../../modifier/modifiers/rooted.modifier';

export const theLostRuins: LocationBlueprint = {
  id: 'the-lost-ruins',
  kind: CARD_KINDS.LOCATION,
  collectable: true,
  name: 'The Lost Ruins',
  description: dedent /*html*/ `
    Minions here are <rt-keyword>Rooted</rt-keyword>.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<LocationCard>('the-lost-ruins', game, card, {
        mixins: [
          new CardAuraModifierMixin<MinionCard>(game, card, {
            isElligible(candidate) {
              return isMinion(candidate) && card.isOnSameBattlefieldAs(candidate);
            },
            getModifiers() {
              return [new RootedModifier(game, card)];
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
