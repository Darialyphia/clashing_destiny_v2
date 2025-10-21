import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { singleEnemyMinionTargetRules } from '../../../card-utils';
import type { MinionCard } from '../../../entities/minion.entity';
import { AbilityDamage } from '../../../../utils/damage';

export const cunningMinister: MinionBlueprint = {
  id: 'cunning-minister',
  name: 'Cunning Minister',
  cardIconId: 'minions/cunning-minister',
  description: dedent``,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 2,
  maxHp: 3,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: null,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [
    {
      id: 'cunning-minister-ability',
      label: 'Deal 1 damage',
      description: `@[exhaust]@ @[mana] 1@ : Deal 1 damage to an enemy minion. If it dies, wake up this minion.`,
      manaCost: 1,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      canUse: singleEnemyMinionTargetRules.canPlay,
      getPreResponseTargets(game, card) {
        return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
          type: 'ability',
          card,
          abilityId: 'cunning-minister-ability'
        });
      },
      async onResolve(game, card, targets) {
        const target = targets[0] as MinionCard;
        await target.takeDamage(card, new AbilityDamage(1));
        if (!target.isAlive) {
          await card.wakeUp();
        }
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
