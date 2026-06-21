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
                new SimpleAttackBuffModifier('day-of-conquest-power-buff', game, card, {
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

export const restrainTheBeast: DestinyBlueprint = {
  id: 'restrain-the-beast',
  kind: CARD_KINDS.DESTINY,
  collectable: true,
  name: 'Restrain the Beast',
  description: dedent /*html*/ `
    When a creature with 5 Attack or more moves to this battlefield, exhaust it.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<DestinyCard>('restrain-the-beast', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_MOVE,
            filter(event) {
              return !!(
                isMinion(event.data.card) &&
                event.data.card.atk >= 5 &&
                event.data.to.position.zone === card.battlefield?.zone
              );
            },
            async handler(event) {
              await event.data.card.exhaust();
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};

export const crowdsFavor: DestinyBlueprint = {
  id: 'crowds-favor',
  kind: CARD_KINDS.DESTINY,
  collectable: true,
  name: "Crowd's Favor",
  description: dedent /*html*/ `
    Minion(s) at this battlefield with the highest Attack have +1 Commandment.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<DestinyCard>('crowds-favor', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              if (!isMinion(candidate)) return false;

              const highestAttackOnBattlefield = Math.max(
                ...card
                  .battlefield!.allSpaces.map(space => space.card)
                  .filter(isDefined)
                  .filter(isMinion)
                  .map(minion => minion.atk)
              );
              if (candidate.atk !== highestAttackOnBattlefield) return false;

              return card.battlefield!.has(candidate);
            },
            getModifiers() {
              return [
                new SimpleCommandmentBuffModifier(
                  'crowds-favor-commandment-buff',
                  game,
                  card,
                  {
                    isUnique: false,
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
