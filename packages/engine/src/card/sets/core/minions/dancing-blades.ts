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
import { OnMoveModifier } from '../../../../modifier/modifiers/on-move.modifier';
import { AbilityDamage } from '../../../../utils/damage';

export const dancingBlades: MinionBlueprint = {
  id: 'dancing-blades',
  name: 'Dancing Blades',
  description: dedent /*html*/ `
  <rt-trigger>On Engage</rt-trigger> Deal 3 damage to the minion in front of this.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/dancing-blades'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.NEUTRAL, AFFINITIES.NEUTRAL, AFFINITIES.NEUTRAL],
  manaCost: 5,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 4,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        location: 'battlefield',
        fromlocation: 'base',
        async handler() {
          const inFront = card.position?.inFront?.card;
          if (!inFront) return;
          if (!isMinion(inFront)) return;
          await inFront.takeDamage(card, new AbilityDamage(3));
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
