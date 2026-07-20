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
import { Modifier } from '../../../../modifier/modifier.entity';
import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';

export const austerity: DestinyBlueprint = {
  id: 'austerity',
  kind: CARD_KINDS.DESTINY,
  collectable: true,
  name: 'Austerity',
  description: dedent /*html*/ `
    Minions at this battlefield have 0 CMD.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<DestinyCard>('ashes-of-pain', game, card, {
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
                new Modifier('austerity-aura', game, card, {
                  mixins: [
                    new MinionInterceptorModifierMixin(game, {
                      key: 'commandment',
                      interceptor: () => 0,
                      priority: 100
                    })
                  ]
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
