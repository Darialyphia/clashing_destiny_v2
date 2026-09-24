import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  defaultCardArt,
  minionTargetRules,
  singleAllyMinionTargetRules,
  singleMinionTargetRules
} from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { InstantModifier } from '../../../../modifier/modifiers/instant.modifier';

export const juxtaposition: SpellBlueprint<MinionCard> = {
  id: 'juxtaposition',
  name: 'Juxtaposition',
  description: dedent /*html*/ `
  <rt-keyword>Instant</rt-keyword>. Swap the position of two minions with the same owner.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/juxtaposition'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.EPIC,
  affinities: [AFFINITIES.FIRE, AFFINITIES.NEUTRAL],
  manaCost: 2,
  manaSupply: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: (game, card) =>
    minionTargetRules.canPlay(game, card, {
      min: 2,
      predicate: minion =>
        minion.player.minions.filter(
          minion => minion.canBeTargeted(card) && minion.canMove
        ).length >= 2
    }),
  getTargets: async (game, card) => {
    const minion1 = await singleMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      predicate: minion => minion.canMove,
      aiHints: {
        shouldPick: () => 1
      }
    });

    if (minion1.cancelled) return { cancelled: true, result: null };

    const minion2 = await singleMinionTargetRules.getTargets({
      game,
      card,
      predicate: minion => minion.isAlly(minion1.result.cards[0]) && minion.canMove,
      timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      aiHints: {
        shouldPick: () => 1
      }
    });

    if (minion2.cancelled) return { cancelled: true, result: null };

    return {
      cancelled: false,
      result: {
        cards: [...minion1.result.cards, ...minion2.result.cards],
        spaces: [],
        effect: null
      }
    };
  },
  async onInit(game, card) {
    await card.modifiers.add(new InstantModifier(game, card));
  },
  async onPlay(game, card, targets) {
    const [minion1, minion2] = targets.cards;
    if (!minion1 || !minion2) return;

    await minion1.player.boardSide.swapMinionPositions(minion1, minion2);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
