import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  isMinion,
  singleAllyMinionTargetRules
} from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SpellDamage } from '../../../../utils/damage';

export const backstep: SpellBlueprint<MinionCard> = {
  id: 'backstep',
  name: 'Backstep',
  description: dedent /*html*/ `
  Choose an ally minion at a battlefield. It deals 1 damage to the minion in front of it then moves to your base.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/backstep'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE],
  manaCost: 1,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: (game, card) =>
    singleAllyMinionTargetRules.canPlay(
      game,
      card,
      minion => minion.isOnBattlefield && minion.canMove
    ) && card.player.boardSide.hasEmptySpaceInBase,
  getTargets: async (game, card) => {
    const minionToMove = await singleAllyMinionTargetRules.getTargets({
      game,
      card,
      predicate: minion => minion.isOnBattlefield && minion.canMove,
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
      predicate: space =>
        space.player.equals(card.player) && space.position.zone === CARD_LOCATIONS.BASE,
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
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets.cards[0];
    if (!target) return;

    const destination = targets.spaces[0];
    if (!destination) return;

    const inFront = card.position?.inFront?.card;
    if (!inFront) return;
    if (!isMinion(inFront)) return;
    await inFront.takeDamage(card, new SpellDamage(1, card));

    await target.move(destination.position.zone, destination.position.index);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
