import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { HeroBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const noviceLv0: HeroBlueprint = {
  id: 'novice-lv0',
  name: 'Child of Destiny',
  description: '@On Enter@: Draw 7 cards.',
  collectable: false,
  level: 0,
  cardIconId: 'heroes/novice-lv0',
  destinyCost: 0,
  speed: CARD_SPEED.SLOW,
  canPlay: () => true,
  kind: CARD_KINDS.HERO,
  jobs: [],
  spellSchools: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 15,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      id: 'novice-ability-1',
      label: '@[mana] 1@ @[exhaust]@ : replace cards from hand',
      description:
        '@[mana] 1@ @[exhaust]@ : Choose up to 3 cards in your hand. Put them at the bottom of your deck, then draw that many cards. @Seal@ this ability.',
      canUse: () => true,
      speed: CARD_SPEED.SLOW,
      manaCost: 1,
      shouldExhaust: true,
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card, targets, ability) {
        const choices = await game.interaction.chooseCards({
          player: card.player,
          label: 'Choose up to 3 cards in your hand to put at the bottom of your deck',
          minChoiceCount: 0,
          maxChoiceCount: 3,
          choices: card.player.cardManager.hand
        });

        for (const choice of choices) {
          choice.removeFromCurrentLocation();
          choice.player.cardManager.mainDeck.addToBottom(choice);
        }

        await card.player.cardManager.draw(choices.length);

        ability.seal();
      }
    }
  ],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          await card.player.cardManager.draw(7);
        }
      })
    );
  },
  async onPlay() {}
};
