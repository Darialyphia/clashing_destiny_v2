import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  singleAllyMinionTargetRules
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

export const mistWalking: SpellBlueprint<MinionCard> = {
  id: 'mistWalking',
  name: 'Mist Walking',
  description: dedent /*html*/ `
  <rt-keyword>Instant</rt-keyword>.
  Move an ally minion.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/mist-walking'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE, AFFINITIES.FIRE],
  manaCost: 1,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: (game, card) =>
    singleAllyMinionTargetRules.canPlay(game, card) &&
    card.player.boardSide.hasEmptySpace,
  getTargets: async (game, card) => {
    const minionToMove = await singleAllyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      aiHints: {
        shouldPick: () => 1
      }
    });

    if (minionToMove.cancelled) return { cancelled: true, result: null };

    const destination = await emptyBoardSpaceTargetRules.getTargets({
      game,
      card,
      predicate: space => space.player.equals(card.player),
      label: 'Select a space to move the minion to.'
    });

    if (destination.cancelled) return { cancelled: true, result: null };

    return {
      cancelled: false,
      result: {
        cards: minionToMove.result.cards,
        spaces: destination.result.spaces,
        effect: null
      }
    };
  },
  async onInit(game, card) {
    await card.modifiers.add(new InstantModifier(game, card));
  },
  async onPlay(game, card, targets) {
    const target = targets.cards[0];
    if (!target) return;

    const destination = targets.spaces[0];
    if (!destination) return;

    await target.move(destination.position.zone, destination.position.index);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
