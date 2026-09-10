import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { discardFromHand } from '../../../card-actions-utils';
import { OnMoveModifier } from '../../../../modifier/modifiers/on-move.modifier';

export const rythmweaver: MinionBlueprint = {
  id: 'rythmweaver',
  name: 'Rythmweaver',
  description: dedent /*html*/ `
  <rt-trigger>On Move</rt-trigger> Discard a card, then draw a card.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/rythmweaver'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 2,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        async handler() {
          if (card.player.cardManager.hand.length === 0) return;
          await discardFromHand(game, card, { min: 1, max: 1 });
          await card.player.cardManager.draw(1);
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
