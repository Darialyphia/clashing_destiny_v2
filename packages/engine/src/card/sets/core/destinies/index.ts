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
import { SimplePowerBuffModifier } from '../../../../modifier/modifiers/simple-power-buff.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const dayOfFortitude: DestinyBlueprint = {
  id: 'day-of-fortitude',
  kind: CARD_KINDS.DESTINY,
  collectable: true,
  name: 'Day of Fortitude',
  description: dedent /*html*/ `
    Minions at this battlefield have +1 Power while defending.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('destinies/day-of-fortitude'),
  speed: CARD_SPEED.SLOW,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<DestinyCard>('day-of-fortitude', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return card
                .battlefield!.allSpaces.map(space => space.card)
                .filter(isDefined)
                .some(c => c.equals(candidate));
            },
            getModifiers(candidate) {
              return [
                new SimplePowerBuffModifier('day-of-fortitude-power-buff', game, card, {
                  isUnique: false,
                  amount: 1,
                  mixins: [
                    new TogglableModifierMixin(
                      game,
                      () => !!game.combatSystem.defender?.equals(candidate)
                    )
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

export const dayOfConquest: DestinyBlueprint = {
  id: 'day-of-conquest',
  kind: CARD_KINDS.DESTINY,
  collectable: true,
  name: 'Day of Conquest',
  description: dedent /*html*/ `
    Minions at this battlefield have +1 Power while attacking.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('destinies/day-of-conquest'),
  speed: CARD_SPEED.SLOW,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<DestinyCard>('day-of-conquest', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return card
                .battlefield!.allSpaces.map(space => space.card)
                .filter(isDefined)
                .some(c => c.equals(candidate));
            },
            getModifiers(candidate) {
              return [
                new SimplePowerBuffModifier('day-of-conquest-power-buff', game, card, {
                  isUnique: false,
                  amount: 1,
                  mixins: [
                    new TogglableModifierMixin(
                      game,
                      () => !!game.combatSystem.attacker?.equals(candidate)
                    )
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
