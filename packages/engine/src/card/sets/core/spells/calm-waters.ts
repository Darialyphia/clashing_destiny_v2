import type { SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import { TidesFavoredModifier } from '../../../../modifier/modifiers/tide-modifier';
import dedent from 'dedent';
import { scry } from '../../../card-actions-utils';

export const calmWaters: SpellBlueprint = {
  id: 'calm-waters',
  name: 'Calm Waters',
  cardIconId: 'spell-calm-waters',
  description: dedent`Draw a card in your Destiny Zone.
  @Tide (2+)@ : Scry 2.
  @Tides (3)@ : Draw a card.
  `,
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.WATER,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit() {},
  async onPlay(game, card) {
    const tidesModifier = card.player.hero.modifiers.get(TidesFavoredModifier);
    if (!tidesModifier) return;

    await card.player.cardManager.drawIntoDestinyZone(1);
    if (tidesModifier.stacks >= 2) {
      await scry(game, card, 2);
    }
    if (tidesModifier.stacks === 3) {
      await card.player.cardManager.draw(1);
    }
  }
};
