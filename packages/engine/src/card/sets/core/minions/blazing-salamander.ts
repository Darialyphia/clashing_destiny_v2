import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { fireBolt } from '../spells/fire-bolt';

export const blazingSalamander: MinionBlueprint = {
  id: 'blazingSalamander',
  name: 'Blazing Salamander',
  cardIconId: 'blazing-salamander',
  description: `@On Enter@: Inflict @Burn@ to all other minions in the same row as this minion. Then if 5 or more minions are affected by @Burn@, draw a card.`,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 2,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        const affectedMinions = game.boardSystem
          .getColumn(card.position!.slot)
          .minions.filter(minion => !minion.equals(card));

        for (const minion of affectedMinions) {
          await minion.modifiers.add(new BurnModifier(game, card));
        }

        if (affectedMinions.length >= 5) {
          await card.player.cardManager.draw(1);
        }
      })
    );
  },
  async onPlay() {}
};
