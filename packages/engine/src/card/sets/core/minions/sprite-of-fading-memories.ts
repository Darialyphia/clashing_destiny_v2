import { LingeringDestinyModifier } from '../../../../modifier/modifiers/lingering-destiny.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const spriteOfFadingMemories: MinionBlueprint = {
  id: 'sprite-of-fading-memories',
  name: 'Sprite of Fading Memories',
  cardIconId: 'minions/sprite-of-fading-memories',
  description: `@On Enter@: your opponent puts one card from their hand in their Destiny Zone.`,
  collectable: true,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 1,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          if (card.player.opponent.cardManager.hand.length === 0) return;

          const [selectedCard] = await game.interaction.chooseCards({
            player: card.player.opponent,
            label: 'Choose a card to put in your Destiny Zone',
            minChoiceCount: 1,
            maxChoiceCount: 1,
            choices: card.player.opponent.cardManager.hand
          });

          await selectedCard.sendToDestinyZone();
        }
      })
    );
  },
  async onPlay() {}
};
