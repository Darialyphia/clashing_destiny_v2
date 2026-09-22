import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleBattlefield } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { DestinyCard } from '../../../entities/destiny.entity';

export const augury: SpellBlueprint<DestinyCard> = {
  id: 'augury',
  name: 'Augury',
  description: dedent /*html*/ `
  Gain 1 influence at a battlefield, then if you have 3 or more influence here, draw a card and gain 1 mana.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/augury'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT],
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: () => true,
  getTargets: (game, card) =>
    singleBattlefield.getTargets({
      game,
      card,
      canCancel: true,
      predicate: () => true,
      aiHints: { shouldPick: () => 1 },
      label: 'Select a battlefield',
      timeoutFallback: []
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    await target.battlefield!.gainScore(1);
    if (target.battlefield!.commandmentScore >= 3) {
      await card.player.cardManager.draw(1);
      await card.player.manaManager.gain(1);
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
