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
import { FlankingModifier } from '../../../../modifier/modifiers/flanking.modifier';
import { OnMoveModifier } from '../../../../modifier/modifiers/on-move.modifier';
import { isDefined } from '@game/shared';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';

export const incinera: MinionBlueprint = {
  id: 'incinera',
  name: 'Incinera',
  description: dedent /*html*/ `
    <rt-keyword>Flanking</rt-keyword><br/>
    <rt-trigger>On Move</rt-trigger>: if I am at a battlefield, gain influence here equal to the amount of enemy minions with <rt-keyword>Burn</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/incinera'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  manaCost: 5,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 4,
  maxHp: 4,
  affinities: [AFFINITIES.AIR, AFFINITIES.AIR],
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new FlankingModifier(game, card));
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        location: 'battlefield',
        async handler() {
          const burningEnemies = card
            .battlefield!.opponentSpaces.map(space => space.card)
            .filter(isDefined)
            .filter(isMinion)
            .filter(minion => minion.modifiers.has(BurnModifier));

          await card.battlefield?.gainScore(burningEnemies.length);
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
