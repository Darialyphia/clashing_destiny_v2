import dedent from 'dedent';
import { isDefined } from '@game/shared';
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
import { SimpleCommandmentBuffModifier } from '../../../../modifier/modifiers/simple-commandment-modifier';

export const tutorialMoonlitPass: DestinyBlueprint = {
  id: 'tutorial-moonlit-pass',
  kind: CARD_KINDS.DESTINY,
  collectable: false,
  name: 'Moonlit Pass',
  description: dedent /*html*/ `
    Minions here have +1 influence.
  `,
  setId: CARD_SETS.TUTORIAL,
  rarity: RARITIES.TOKEN,
  art: defaultCardArt('destinies/amber-pass'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<DestinyCard>('tutorial-moonlit-pass', game, card, {
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
                new SimpleCommandmentBuffModifier(
                  'tutorial-moonlit-pass-aura',
                  game,
                  card,
                  {
                    amount: 1
                  }
                )
              ];
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
