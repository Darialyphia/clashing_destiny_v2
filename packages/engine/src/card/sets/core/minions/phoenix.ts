import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { LoyaltyModifier } from '../../../../modifier/modifiers/loyalty.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { PrideModifier } from '../../../../modifier/modifiers/pride.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { immortalFlame } from '../artifacts/immortal-flame';

export const phoenix: MinionBlueprint = {
  id: 'phoenix',
  name: 'Phoenix',
  cardIconId: 'unit-rainbow-phoenix',
  description: `@On Enter@: inflicts @Burn@ to all enemy minions.`,
  collectable: true,
  unique: false,
  manaCost: 5,
  atk: 4,
  maxHp: 5,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  tags: [],
  abilities: [
    {
      id: 'phoenix-ability',
      label: 'Use ability',
      description: `@Loyalty(2)@, @Pride(2)@.\n@[mana] 2@@[exhaust]@ Banish this minion. Equip an Immortal Flame to your hero.`,
      manaCost: 2,
      shouldExhaust: true,
      canUse(game, card) {
        return card.location === 'board';
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        card.sendToBanishPile();
        const immortalFlameCard = await card.player.generateCard(immortalFlame.id);
        await immortalFlameCard.play();
      }
    }
  ],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LoyaltyModifier(game, card, 2));
    await card.modifiers.add(new PrideModifier(game, card, 2));
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        for (const target of card.player.enemyMinions) {
          await target.modifiers.add(new BurnModifier(game, target));
        }
      })
    );
  },
  async onPlay() {}
};
