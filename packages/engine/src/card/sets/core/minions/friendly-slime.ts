import { AttackerModifier } from '../../../../modifier/modifiers/attacker.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const friendlySlime: MinionBlueprint = {
  id: 'friendly-slime',
  name: 'Friendly Slime',
  cardIconId: 'unit-bubbly-slime',
  description: `@On Enter@: If you have less @Influence@ than your opponent, draw a card into your Destiny Zone.`,
  collectable: true,
  unique: false,
  manaCost: 1,
  atk: 1,
  maxHp: 1,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        if (card.player.influence < card.player.opponent.influence) {
          await card.player.cardManager.drawIntoDestinyZone(1);
        }
      })
    );
  },
  async onPlay() {}
};
