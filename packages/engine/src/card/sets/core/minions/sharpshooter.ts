import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { SpellCard } from '../../../entities/spell.entity';
import { fireBolt } from '../spells/fire-bolt';
import { singleEnemyTargetRules } from '../../../card-utils';
import { AbilityDamage } from '../../../../utils/damage';
import { RangedModifier } from '../../../../modifier/modifiers/ranged.modifier';

export const sharpShooter: MinionBlueprint = {
  id: 'sharpshooter',
  name: 'Sharpshooter',
  cardIconId: 'minions/sharpshooter',
  description: dedent`
  @Ranged@.
  @On Enter@: Deal 1 damage to an enemy.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 2,
  maxHp: 4,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: null,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new RangedModifier(game, card, {}));
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const hasTarget = singleEnemyTargetRules.canPlay(game, card);
          if (!hasTarget) return;

          const [target] = await singleEnemyTargetRules.getPreResponseTargets(
            game,
            card,
            { type: 'card', card }
          );

          await target.takeDamage(card, new AbilityDamage(1));
        }
      })
    );
  },
  async onPlay() {}
};
