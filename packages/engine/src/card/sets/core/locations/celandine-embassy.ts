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
import { Modifier } from '../../../../modifier/modifier.entity';
import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';

export const celandineEmbassy: LocationBlueprint = {
  id: 'celandine-embassy',
  kind: CARD_KINDS.LOCATION,
  collectable: true,
  name: 'Celandine Embassy',
  description: dedent /*html*/ `
    Ready minions here cannot be attacked.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<LocationCard>('celandine-embassy', game, card, {
        mixins: [
          new CardAuraModifierMixin<MinionCard>(game, card, {
            isElligible(candidate) {
              return isMinion(candidate) && card.isOnSameBattlefieldAs(candidate);
            },
            getModifiers(candidate) {
              return [
                new Modifier<MinionCard>('celandine-embassy-aura', game, card, {
                  name: 'Celandine Embassy',
                  description: 'Cannot be attacked while ready.',
                  mixins: [
                    new MinionInterceptorModifierMixin(game, {
                      key: 'canBeAttacked',
                      interceptor: value => value && candidate.isExhausted
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
