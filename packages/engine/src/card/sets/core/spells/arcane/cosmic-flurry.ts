import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../../card-utils';
import {
  JOBS,
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { InstantModifier } from '../../../../../modifier/modifiers/instant.modifier';
import { predict } from '../../../../card-actions-utils';

export const cosmic: SpellBlueprint = {
  id: 'cosmicFlurry',
  name: 'Cosmic Flurry',
  description: dedent /*html*/ `
   This turn, your <rt-card>Astral Ball</rt-card> have
   "<rt-trigger>On Move</rt-trigger> Deal 1 damage to an enemy on a battlefield".
   <rt-runes runes="resonance,focus"></rt-runes> They also gain <rt-keyword>Instant Move</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  shouldHideTargetarrows: true,
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit(game, card) {
    await card.modifiers.add(new InstantModifier(game, card));
  },
  async onPlay(game, card) {
    await predict(game, card);
    if (card.player.runeManager.has({ wisdom: 1, resonance: 1 })) {
      await card.player.cardManager.draw(1);
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
