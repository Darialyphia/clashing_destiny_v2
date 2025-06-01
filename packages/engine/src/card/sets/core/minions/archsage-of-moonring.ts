import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import type { MinionBlueprint } from '../../../card-blueprint';
import { isHero, isMinion } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.card';

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
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        const targets = await game.interaction.selectCardsOnBoard<MinionCard | HeroCard>({
          player: card.player,
          isElligible(candidate) {
            return card.isEnemy(candidate) && (isMinion(candidate) || isHero(candidate));
          },
          canCommit() {
            return true;
          },
          isDone(selectedCards) {
            return selectedCards.length === 4;
          }
        });

        for (const target of targets) {
          await target.takeDamage(card, new AbilityDamage(1));
        }
      })
    );
  },
  async onPlay() {}
};
