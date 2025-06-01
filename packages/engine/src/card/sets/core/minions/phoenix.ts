import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
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
import type { MinionCard } from '../../../entities/minion.card';
import { immortalFlame } from '../artifacts/immortal-flame';

export const phoenix: MinionBlueprint = {
  id: 'phoenix',
  name: 'Phoenix',
  cardIconId: 'phoenix',
  description: `@On Enter@: This gains +1/+0 for each enemy with @Burn@.`,
  collectable: true,
  unique: false,
  manaCost: 5,
  atk: 3,
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
      description: `Banish this minion. Equip an ${immortalFlame.name} to your hero.`,
      manaCost: 4,
      shouldExhaust: true,
      canUse() {
        return true;
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
        const burningEnemies = card.player.opponent.allEnemies.filter(enemy =>
          enemy.modifiers.has(BurnModifier)
        );
        const attackBuff = new SimpleAttackBuffModifier<MinionCard>(
          'phoenix-attack-buff',
          game,
          card,
          { amount: burningEnemies.length }
        );

        await card.modifiers.add(attackBuff);
      })
    );
  },
  async onPlay() {}
};
