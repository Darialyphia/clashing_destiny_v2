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
import { immortalFlame } from '../artifacts/immortal-flame';

export const phoenix: MinionBlueprint = {
  id: 'phoenix',
  name: 'Phoenix',
  cardIconId: 'unit-rainbow-phoenix',
  description: `@Pride(3)@.\n@On Enter@: inflicts @Burn@ to all enemy minions.`,
  collectable: true,
  unique: false,
  manaCost: 5,
  atk: 4,
  maxHp: 4,
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
      description: `@[mana] 2@@[exhaust]@ Banish this minion. Equip an @Immortal Flame@ to your hero.`,
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
