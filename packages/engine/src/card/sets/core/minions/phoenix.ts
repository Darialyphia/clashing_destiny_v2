import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
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
  description: `@Pride(3)@.\n@On Enter@ : inflicts @Burn@ to all enemy minions. @On Death@: If your hero has at least 3 @Ember@ stacks, consume them to equp an @Immortal Flame@ to your hero.`,
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
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        for (const target of card.player.enemyMinions) {
          await target.modifiers.add(new BurnModifier(game, target));
        }
      })
    );

    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async () => {
          const ember = card.player.hero.modifiers.get(EmberModifier);
          if (!ember) return;
          if (ember.stacks >= 3) {
            await ember.removeStacks(3);
            const immortalFlameCard = await card.player.generateCard(immortalFlame.id);
            await immortalFlameCard.play();
          }
        }
      })
    );
  },
  async onPlay() {}
};
