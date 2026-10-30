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

export const tutorialMistveilMarsh: DestinyBlueprint = {
  id: 'tutorial-mistveil-marsh',
  kind: CARD_KINDS.DESTINY,
  collectable: false,
  name: 'Mistveil Marsh',
  description: dedent /*html*/ `
    Minions here have +2 influence.
  `,
  setId: CARD_SETS.TUTORIAL,
  rarity: RARITIES.TOKEN,
  art: defaultCardArt('destinies/forgotten-marsh'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<DestinyCard>('tutorial-mistveil-marsh', game, card, {
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
                  'tutorial-mistveil-marsh-aura',
                  game,
                  card,
                  {
                    amount: 2
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
