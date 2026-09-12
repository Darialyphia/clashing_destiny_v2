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
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../modifier/modifiers/simple-commandment-modifier';
import { SimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { RemoveOnLeaveBoardModifierMixin } from '../../../../modifier/mixins/remove-on-destroyed';

export const mistDragonSeal: SpellBlueprint<MinionCard> = {
  id: 'mistDragonSeal',
  name: 'Mist Dragon Seal',
  description: dedent /*html*/ `
  Move an ally minion to a battlefield. It gains +1/+1/+1.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/mist-dragon-seal'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE, AFFINITIES.NEUTRAL],
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: (game, card) =>
    singleAllyMinionTargetRules.canPlay(game, card) &&
    card.player.boardSide.hasEmptySpaceInBattlefield,
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
      predicate: space =>
        space.player.equals(card.player) &&
        (space.position.zone === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
          space.position.zone === CARD_LOCATIONS.RIGHT_BATTLEFIELD),
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

    await target.move(destination.position.zone, destination.position.index);

    await target.modifiers.add(
      new SimpleAttackBuffModifier('mist-dragon-seal-atk-buff', game, card, {
        amount: 1,
        mixins: [new RemoveOnLeaveBoardModifierMixin(game)]
      })
    );
    await target.modifiers.add(
      new SimpleCommandmentBuffModifier('mist-dragon-seal-cmd-buff', game, card, {
        amount: 1,
        mixins: [new RemoveOnLeaveBoardModifierMixin(game)]
      })
    );
    await target.modifiers.add(
      new SimpleHealthBuffModifier('mist-dragon-seal-hp-buff', game, card, {
        amount: 1,
        mixins: [new RemoveOnLeaveBoardModifierMixin(game)]
      })
    );
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
