import { TidesFavoredModifier } from '../../../../modifier/modifiers/tide-modifier';
import { AbilityDamage } from '../../../../utils/damage';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { isHero } from '../../../card-utils';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';

export const orbOfTheTides: ArtifactBlueprint = {
  id: 'orb-of-the-tides',
  name: 'Orb of the Tides',
  cardIconId: 'artifact-orb-of-tides',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 2,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.WATER,
  durability: 1,
  subKind: ARTIFACT_KINDS.RELIC,
  abilities: [
    {
      id: 'orb-of-the-tides-ability',
      label: '@[exhaust]@ : Increase Tide',
      description: `@[exhaust]@ -1@[durability]@ : Raise your @Tide@ level.`,
      manaCost: 0,
      shouldExhaust: true,
      canUse(game, card) {
        return card.location === 'board';
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.player.hero.modifiers.get(TidesFavoredModifier)?.raiseTides();
        await card.loseDurability(1);
      }
    },
    {
      id: 'orb-of-the-tides-ability-2',
      label: '@[exhaust]@ : Deal 2 damage',
      description: `@[exhaust]@ -1@[durability]@ : Deal 1 damage to target Hero. @Tide (3)@: This doesn't lose durability.`,
      manaCost: 0,
      shouldExhaust: true,
      canUse(game, card) {
        return (
          card.location === 'board' &&
          (card.player.hero.canBeTargeted(card) ||
            card.player.opponent.hero.canBeTargeted(card))
        );
      },
      async getPreResponseTargets(game, card) {
        return await game.interaction.selectCardsOnBoard({
          player: card.player,
          origin: { type: 'ability', card, abilityId: 'orb-of-the-tides-ability-2' },
          isElligible: card => isHero(card) && card.location === 'board',
          canCommit(selectedCards) {
            return selectedCards.length === 1;
          },
          isDone(selectedCards) {
            return selectedCards.length === 1;
          }
        });
      },
      async onResolve(game, card, targets) {
        const target = targets[0] as HeroCard;
        await target.takeDamage(card, new AbilityDamage(1));
        const stacks = card.player.hero.modifiers.get(TidesFavoredModifier)?.stacks ?? 0;
        if (stacks < 3) {
          await card.loseDurability(1);
        }
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
