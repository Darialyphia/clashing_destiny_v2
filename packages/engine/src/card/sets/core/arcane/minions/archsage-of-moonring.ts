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
import { getEmpowerStacks } from '../../../../card-actions-utils';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import type { MinionCard } from '../../../../entities/minion.entity';

export const archsageOfMoonring: MinionBlueprint = {
  id: 'archsage-of-moonring',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Archsage of Moonring',
  description: dedent`
  @On Enter@: Deal 3 damage split among enemies.
  @[lvl] 2 Bonus@: Deal 3 + @Empowered@ stacks instead`,
  dynamicDescription(game, card) {
    const empoweredStacks = getEmpowerStacks(card);
    const bonusDamage = 3 + empoweredStacks;
    return dedent`
    @On Enter@: Deal 3 damage split among enemies.
    @[lvl] 2 Bonus@: Deal @[dynamic]${bonusDamage}|3+ Empowered stacks@ damage split among enemies.`;
  },
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
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 2)
    )) as LevelBonusModifier<MinionCard>;

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          let count = 0;

          const amount = levelMod.isActive ? 3 + getEmpowerStacks(card) : 3;
          while (count < amount) {
            const hasRemainingTargets = singleEnemyTargetRules.canPlay(game, card);
            if (!hasRemainingTargets) break;
            const [target] = await singleEnemyTargetRules.getPreResponseTargets({
              game,
              card,
              origin: {
                type: 'card',
                card
              },
              label: 'Select an enemy to deal damage',
              timeoutFallback: [card.player.opponent.hero]
            });

            await target.takeDamage(card, new AbilityDamage(1));
            count++;
          }
        }
      })
    );
  },
  async onPlay() {}
};
