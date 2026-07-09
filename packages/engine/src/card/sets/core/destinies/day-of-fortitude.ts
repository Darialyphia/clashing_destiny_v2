import dedent from 'dedent';
import type { DestinyBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../card-utils';
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
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { SimpleCommandmentBuffModifier } from '../../../../modifier/modifiers/simple-commandment-modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';


export const dayOfFortitude: DestinyBlueprint = {
  id: 'day-of-fortitude',
  kind: CARD_KINDS.DESTINY,
  collectable: true,
  name: 'Day of Fortitude',
  description: dedent /*html*/ `
    Minions at this battlefield have +1 Attack while defending.
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
                new SimpleAttackBuffModifier('day-of-fortitude-attack-buff', game, card, {
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
