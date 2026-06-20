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

export const conjureMight: SpellBlueprint = {
  id: 'conjureMight',
  name: 'Conjure Might',
  description: dedent /*html*/ `
  Gain 1 <rt-runes runes="might"></rt-runes> until the end of the turn.
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
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    await card.player.runeManager.add([RUNES.MIGHT]);
    game.once(GAME_EVENTS.TURN_END, async () => {
      if (card.player.runeManager.has({ might: 1 })) {
        await card.player.runeManager.remove([RUNES.MIGHT]);
      }
    });
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const conjureWisdom: SpellBlueprint = {
  id: 'conjureWisdom',
  name: 'Conjure Wisdom',
  description: dedent /*html*/ `
  Gain 1 <rt-runes runes="wisdom"></rt-runes> until the end of the turn.
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
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    await card.player.runeManager.add([RUNES.WISDOM]);
    game.once(GAME_EVENTS.TURN_END, async () => {
      if (card.player.runeManager.has({ wisdom: 1 })) {
        await card.player.runeManager.remove([RUNES.WISDOM]);
      }
    });
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const conjureFocus: SpellBlueprint = {
  id: 'conjureFocus',
  name: 'Conjure Focus',
  description: dedent /*html*/ `
  Gain 1 <rt-runes runes="focus"></rt-runes> until the end of the turn.
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
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    await card.player.runeManager.add([RUNES.FOCUS]);
    game.once(GAME_EVENTS.TURN_END, async () => {
      if (card.player.runeManager.has({ focus: 1 })) {
        await card.player.runeManager.remove([RUNES.FOCUS]);
      }
    });
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const conjureResonance: SpellBlueprint = {
  id: 'conjureResonance',
  name: 'Conjure Resonance',
  description: dedent /*html*/ `
  Gain 1 <rt-runes runes="resonance"></rt-runes> until the end of the turn.
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
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    await card.player.runeManager.add([RUNES.RESONANCE]);
    game.once(GAME_EVENTS.TURN_END, async () => {
      if (card.player.runeManager.has({ resonance: 1 })) {
        await card.player.runeManager.remove([RUNES.RESONANCE]);
      }
    });
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
