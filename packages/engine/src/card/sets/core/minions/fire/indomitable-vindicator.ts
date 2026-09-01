import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../../card.enums';
import { AbilityDamage } from '../../../../../utils/damage';
import { OnScoreModifier } from '../../../../../modifier/modifiers/on-score.modifier';
import { isDefined } from '@game/shared';

export const indomitableVindicator: MinionBlueprint = {
  id: 'indomitableVindicator',
  name: 'Indomitable Vindicator',
  description: dedent /*html*/ `
  <rt-keyword>On Score</rt-keyword> Deal 1 damage to all other minions on this battlefield.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/indomitable-vindicator'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  affinities: [],
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnScoreModifier(game, card, {
        async handler(event) {
          const battlefield = event.data.battlefield;
          const targets = [...battlefield.spaces, ...battlefield.opponentSpaces]
            .map(space => space.card)
            .filter(isDefined)
            .filter(isMinion)
            .filter(minion => !minion.equals(card));

          for (const target of targets) {
            await target.takeDamage(card, new AbilityDamage(1));
          }
        }
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
