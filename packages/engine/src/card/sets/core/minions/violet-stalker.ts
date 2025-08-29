import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { StealthModifier } from '../../../../modifier/modifiers/stealth.modifier';
import { scry } from '../../../card-actions-utils';
import type { MinionBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import dedent from 'dedent';
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.entity';
import { AbilityDamage } from '../../../../utils/damage';

export const violetStalker: MinionBlueprint = {
  id: 'violet-stalker',
  name: 'Violet Stalker',
  cardIconId: 'unit-violet-stalker',
  description: dedent`
  @Stealth@.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 1,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.ARCANE,
  setId: CARD_SETS.CORE,
  abilities: [
    {
      id: 'violet-stalker-ability',
      description: '@[exhaust]@ @[mana] 1@ : Deal 2 damage to an exhausted enemy.',
      label: '@[exhaust]@ @[mana] 1@ Deal 2 damage',
      manaCost: 1,
      shouldExhaust: true,
      canUse: (game, card) =>
        card.location === 'board' &&
        singleEnemyTargetRules.canPlay(game, card, candidate => candidate.isExhausted),
      getPreResponseTargets(game, card) {
        return singleEnemyTargetRules.getPreResponseTargets(
          game,
          card,
          {
            abilityId: 'violet-stalker-ability',
            type: 'ability',
            card
          },
          candidate => candidate.isExhausted
        );
      },
      async onResolve(game, card, targets) {
        const target = targets[0] as MinionCard | HeroCard;

        await target.takeDamage(card, new AbilityDamage(2));
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new StealthModifier(game, card, {}));
  },
  async onPlay() {}
};
