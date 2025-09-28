import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const friendlySlime: MinionBlueprint = {
  id: 'friendly-slime',
  name: 'Friendly Slime',
  cardIconId: 'minions/friendly-slime',
  description: `@On Enter@ : If you have less @Influence@ than your opponent, draw a card into your Destiny Zone.`,
  collectable: true,
  unique: false,
  manaCost: 1,
  atk: 1,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  setId: CARD_SETS.CORE,
  speed: CARD_SPEED.SLOW,
  job: null,
  spellSchool: null,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          if (card.player.influence < card.player.opponent.influence) {
            await card.player.cardManager.drawIntoDestinyZone(1);
          }
        }
      })
    );
  },
  async onPlay() {}
};
