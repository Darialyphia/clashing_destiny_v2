import { OnKillModifier } from '../../../../modifier/modifiers/on-kill.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const pyreboundLancer: MinionBlueprint = {
  id: 'pyrebound-lancer',
  name: 'Pyrebound Lancer',
  cardIconId: 'unit-pyrebound-lancer',
  description: `@On Kill@ : Put the last spell from your discard pile in your hand.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 2,
  maxHp: 4,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnKillModifier(game, card, {
        async handler() {
          const lastSpell = [...card.player.cardManager.discardPile].findLast(
            c => c.kind === CARD_KINDS.SPELL
          );

          if (!lastSpell) return;
          card.player.cardManager.addToHand(lastSpell);
        }
      })
    );
  },
  async onPlay() {}
};
