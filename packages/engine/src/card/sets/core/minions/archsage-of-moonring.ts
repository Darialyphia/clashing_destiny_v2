import dedent from 'dedent';
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
import { HeroJobAffinityModifier } from '../../../../modifier/modifiers/hero-job-affinity.modifier';
import type { MinionCard } from '../../../entities/minion.entity';

export const archsageOfMoonring: MinionBlueprint = {
  id: 'archsage-of-moonring',
  name: 'Archsage of Moonring',
  cardIconId: 'minions/archsage-of-moonring',
  description: dedent`
  @On Enter@: Deal 3 damage split among enemies.
  @Mage Affinity@ : Deal 1 additional damage.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 4,
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
    const mageMod = (await card.modifiers.add(
      new HeroJobAffinityModifier(game, card, HERO_JOBS.MAGE)
    )) as HeroJobAffinityModifier<MinionCard>;

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          let count = 0;
          const max = mageMod.isActive ? 4 : 3;

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
