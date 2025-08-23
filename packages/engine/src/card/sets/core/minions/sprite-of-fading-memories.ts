import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleManaCostBuffModifier } from '../../../../modifier/modifiers/simple-mana-cost-buff.modifier';
import { scry } from '../../../card-actions-utils';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import dedent from 'dedent';

export const spriteOfFadingMemories: MinionBlueprint = {
  id: 'sprite-of-fading-memories',
  name: 'Sprite of Fading Memories',
  cardIconId: 'unit-sprite-of-fading-memories',
  description: dedent`
  @On Enter@ : Choose a card in the opponent's Destiny Zone. It costs @[mana] 2@ more.`,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 1,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          if (card.player.opponent.cardManager.destinyZone.size === 0) return;

          const [selectedCard] = await game.interaction.chooseCards({
            player: card.player,
            label: "Choose a card in the opponent's Destiny Zone",
            minChoiceCount: 1,
            maxChoiceCount: 1,
            choices: Array.from(card.player.opponent.cardManager.destinyZone)
          });

          await selectedCard.modifiers.add(
            new SimpleManaCostBuffModifier(
              'sprite-of-fading-memories-debuff',
              game,
              card,
              { amount: 1 }
            )
          );
        }
      })
    );
  },
  async onPlay() {}
};
