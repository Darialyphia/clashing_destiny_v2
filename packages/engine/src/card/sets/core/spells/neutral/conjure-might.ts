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
import { discardFromHand } from '../../../../card-actions-utils';
import { InstantModifier } from '../../../../../modifier/modifiers/instant.modifier';

export const conjureMight: SpellBlueprint = {
  id: 'conjureMight',
  name: 'Conjure Might',
  description: dedent /*html*/ `
  <rt-keyword>Instant</rt-keyword>
  Discard a card to gain 1 <rt-runes runes="might"></rt-runes>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder-spell'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 2,
  runeCost: [],
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetarrows: true,
  canPlay: (game, card) => card.player.cardManager.hand.length > 0,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit(game, card) {
    await card.modifiers.add(new InstantModifier(game, card));
  },
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
