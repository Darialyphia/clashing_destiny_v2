import dedent from 'dedent';
import type { HeroBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { scry } from '../../../card-actions-utils';

export const erinaLv2: HeroBlueprint = {
  id: 'erina-lv2',
  name: 'Erina, Aether Scholar',
  description: dedent`
  @Erina Lineage@.
  @On Enter@: @Scry 2@.
  `,
  cardIconId: 'heroes/erina-lv2',
  kind: CARD_KINDS.HERO,
  level: 2,
  destinyCost: 2,
  speed: CARD_SPEED.SLOW,
  jobs: [HERO_JOBS.MAGE],
  spellSchools: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: 'erina',
  spellPower: 0,
  atk: 0,
  maxHp: 21,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      id: 'erina-lv2-ability',
      canUse(game, card) {
        return card.location === 'board';
      },
      description: dedent`@[mana] 2@@[exhaust]@ : Draw a card in your Destiny Zone.`,
      getPreResponseTargets: async () => [],
      label: '@[mana] 2@@[exhaust]@ : Draw a card, then discard a card.',
      manaCost: 2,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      async onResolve(game, card) {
        await card.player.cardManager.draw(1);
        if (card.player.cardManager.hand.length === 0) return;

        const [cardToDiscard] = await game.interaction.chooseCards({
          player: card.player,
          label: 'Choose a card to discard',
          minChoiceCount: 1,
          maxChoiceCount: 1,
          choices: card.player.cardManager.hand
        });
        await cardToDiscard.discard();
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          await scry(game, card, 2);
        }
      })
    );
  },
  async onPlay() {}
};
