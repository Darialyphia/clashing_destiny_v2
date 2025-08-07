import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { isMinion } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const crimsonSuppressor: MinionBlueprint = {
  id: 'crimson-suppressor',
  name: 'Crimson Suppressor',
  cardIconId: 'unit-crimson-suppressor',
  description: `@On Enter@ : Destroy an injured minion.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 3,
  maxHp: 4,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.BLOOD,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        const elligibleTargets = [
          ...card.player.minions,
          ...card.player.opponent.minions
        ].filter(minion => minion.remainingHp < minion.maxHp);

        if (!elligibleTargets.length) return;

        const [target] = await game.interaction.selectCardsOnBoard<MinionCard>({
          player: card.player,
          origin: { type: 'card', card },
          isElligible(candidate) {
            return isMinion(candidate) && candidate.remainingHp < candidate.maxHp;
          },
          canCommit(selectedCards) {
            return selectedCards.length === 1;
          },
          isDone(selectedCards) {
            return selectedCards.length === 1;
          }
        });

        if (!target) return;

        await target.destroy();
      })
    );
  },
  async onPlay() {}
};
