import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
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
  cardIconId: 'phoenix',
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
      description: `@[mana] 4@@[exhaust]@ Banish this minion. Equip an Immortal Flame to your hero.`,
      manaCost: 3,
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
    const targets = card.player.enemyMinions;

    for (const target of targets) {
      await target.modifiers.add(new BurnModifier(game, target));
    }
  },
  async onPlay() {}
};
