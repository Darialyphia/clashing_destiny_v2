import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { isDefined } from '@game/shared';

export const suntideMaiden: MinionBlueprint = {
  id: 'suntide-maiden',
  name: 'Suntide Maiden',
  description: dedent /*html*/ `
  <rt-keyword>Zeal 4</rt-keyword>: Heal all minions here for 3.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/suntide-maiden'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  manaCost: 4,
  manaSupply: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
  affinities: [AFFINITIES.LIGHT],
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new ZealModifier(game, card, {
        amount: 4,
        zealedModifiers: [],
        onGainZeal: async () => {
          const minionstoHeal =
            card.battlefield?.spaces
              .map(space => space.card)
              .filter(isDefined)
              .filter(isMinion) ?? [];

          for (const minion of minionstoHeal) {
            await minion.heal(3);
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
