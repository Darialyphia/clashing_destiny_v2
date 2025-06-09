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
  cardIconId: 'archsage-of-moonring',
  description: `@On Enter@: deal up to 4 damage split among enemies.`,
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
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        const targets = await multipleEnemyTargetRules.getPreResponseTargets({
          min: 0,
          max: 4,
          allowRepeat: true
        })(game, card);
        for (const target of targets) {
          await target.takeDamage(card, new AbilityDamage(1));
        }
      })
    );
  },
  async onPlay() {}
};
