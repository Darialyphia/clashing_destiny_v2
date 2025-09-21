import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { AnyCard } from '../../../entities/card.entity';

export const revisedStrategy: SpellBlueprint = {
  id: 'revised-strategy',
  name: 'Revised Strategy',
  cardIconId: 'spell-revise-strategy',
  description: dedent`
  Look at your deck and banish 3 cards from it. Shuffle your deck and Draw a card.`,
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit() {},
  async onPlay(game, card) {
    const cards = await game.interaction.chooseCards<AnyCard>({
      player: card.player,
      choices: card.player.cardManager.mainDeck.cards,
      label: 'Choose 3 cards to banish from your deck',
      minChoiceCount: 3,
      maxChoiceCount: 3
    });

    for (const cardToBanish of cards) {
      cardToBanish.sendToBanishPile();
    }
    await card.player.cardManager.mainDeck.shuffle();
    await card.player.cardManager.draw(1);
  }
};
