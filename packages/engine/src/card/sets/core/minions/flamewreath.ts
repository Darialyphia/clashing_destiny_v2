import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';
import { isDefined } from '@game/shared';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { OnMoveModifier } from '../../../../modifier/modifiers/on-move.modifier';
import { FlankingModifier } from '../../../../modifier/modifiers/flanking.modifier';

export const flamewreath: MinionBlueprint = {
  id: 'flamewreath',
  name: 'Flamewreath',
  description: dedent /*html*/ `
  <rt-keyword>Flanking</rt-keyword><br/>
  <rt-trigger>On Move</rt-trigger> Inflict <rt-keyword>Burn 1</rt-keyword> to all enemies at this battlefield.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/flamewreath'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.FIRE, AFFINITIES.FIRE],
  manaCost: 5,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new FlankingModifier(game, card));
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        async handler() {
          if (!card.isOnBattlefield) return;

          const enemies = card
            .battlefield!.opponentSpaces.map(space => space.card)
            .filter(isDefined);
          for (const enemy of enemies) {
            await enemy?.modifiers.add(new BurnModifier(game, card, { stacks: 1 }));
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
