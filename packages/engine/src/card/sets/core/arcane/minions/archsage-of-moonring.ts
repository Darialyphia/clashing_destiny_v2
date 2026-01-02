import dedent from 'dedent';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { AbilityDamage } from '../../../../../utils/damage';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';

export const archsageOfMoonring: MinionBlueprint = {
  id: 'archsage-of-moonring',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Archsage of Moonring',
  description: dedent`@On Enter@: Deal 3 damage split among enemies.`,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.EPIC,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: false,
        oil: true,
        gradient: false,
        lightGradient: false,
        scanlines: true,
        goldenGlare: true
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'minions/archsage-of-moonring-bg',
      main: 'minions/archsage-of-moonring',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          let count = 0;

          while (count < 3) {
            const hasRemainingTargets = singleEnemyTargetRules.canPlay(game, card);
            if (!hasRemainingTargets) break;
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
