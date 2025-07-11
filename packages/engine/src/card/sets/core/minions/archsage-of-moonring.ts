import { LoyaltyModifier } from '../../../../modifier/modifiers/loyalty.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { multipleEnemyTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const archsageOfMoonring: MinionBlueprint = {
  id: 'archsage-of-moonring',
  name: 'Archsage of Moonring',
  cardIconId: 'unit-archsage-of-moonring',
  description: `@Loyalty(1)@\n@On Enter@: deal up to 3 damage split among enemies.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 1,
  maxHp: 3,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.ARCANE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LoyaltyModifier(game, card, 1));
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        let count = 0;
        while (count < 3) {
          const targets = await multipleEnemyTargetRules.getPreResponseTargets({
            min: 0,
            max: 1,
            allowRepeat: true
          })(game, card);
          if (!targets || targets.length === 0) {
            break;
          }
          for (const target of targets) {
            await target.takeDamage(card, new AbilityDamage(1));
            count++;
          }
        }
      })
    );
  },
  async onPlay() {}
};
