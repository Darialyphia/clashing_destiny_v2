import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { RUNES } from '../../../../../player/player.enums';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { discardFromHand } from '../../../../card-actions-utils';

export const conjureMight: SpellBlueprint = {
  id: 'conjureMight',
  name: 'Conjure Might',
  description: dedent /*html*/ `
  Discard a card to gain 1 <rt-runes runes="might"></rt-runes>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  canPlay: (game, card) => card.player.cardManager.hand.length > 0,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    if (card.player.cardManager.hand.length === 0) return;
    await discardFromHand(game, card, {
      min: 1,
      max: 1
    });
    await card.player.runeManager.add([RUNES.MIGHT]);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const conjureWisdom: SpellBlueprint = {
  id: 'conjureWisdom',
  name: 'Conjure Wisdom',
  description: dedent /*html*/ `
  Discard a card to gain 1 <rt-runes runes="wisdom"></rt-runes>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  canPlay: (game, card) => card.player.cardManager.hand.length > 0,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    if (card.player.cardManager.hand.length === 0) return;
    await discardFromHand(game, card, {
      min: 1,
      max: 1
    });
    await card.player.runeManager.add([RUNES.WISDOM]);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const conjureFocus: SpellBlueprint = {
  id: 'conjureFocus',
  name: 'Conjure Focus',
  description: dedent /*html*/ `
  Discard a card to gain 1 <rt-runes runes="focus"></rt-runes>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  canPlay: (game, card) => card.player.cardManager.hand.length > 0,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    if (card.player.cardManager.hand.length === 0) return;
    await discardFromHand(game, card, {
      min: 1,
      max: 1
    });
    await card.player.runeManager.add([RUNES.FOCUS]);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const conjureResonance: SpellBlueprint = {
  id: 'conjureResonance',
  name: 'Conjure Resonance',
  description: dedent /*html*/ `
  Discard a card to gain 1 <rt-runes runes="resonance"></rt-runes>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  canPlay: (game, card) => card.player.cardManager.hand.length > 0,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    if (card.player.cardManager.hand.length === 0) return;
    await discardFromHand(game, card, {
      min: 1,
      max: 1
    });
    await card.player.runeManager.add([RUNES.RESONANCE]);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
