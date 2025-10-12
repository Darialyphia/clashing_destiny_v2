import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';

export const archsageOfMoonring: MinionBlueprint = {
  id: 'archsage-of-moonring',
  name: 'Archsage of Moonring',
  cardIconId: 'minions/archsage-of-moonring',
  description: `@On Enter@: Deal damage to an enemy. Repeat this for every spell you played this turn.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 5,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: HERO_JOBS.MAGE,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          let count = 0;
          const max = card.player.cardTracker.getCardsPlayedThisGameTurnOfKind(
            CARD_KINDS.SPELL
          ).length;
          while (count < max + 1) {
            const [target] = await singleEnemyTargetRules.getPreResponseTargets(
              game,
              card,
              {
                type: 'card',
                card
              }
            );

            await target.takeDamage(card, new AbilityDamage(1));
            count++;
          }
        }
      })
    );
  },
  async onPlay() {}
};
