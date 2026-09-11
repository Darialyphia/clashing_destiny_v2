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
import { StealthModifier } from '../../../../modifier/modifiers/stealth.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { BackstabModifier } from '../../../../modifier/modifiers/backstab.modifier';

export const assassinationProtocol: SpellBlueprint<MinionCard> = {
  id: 'assassinationProtocol',
  name: 'Assassination Protocol',
  description: dedent /*html*/ `
  Move an ally with a cost of <rt-mana>3</rt-mana> or less. Give it <rt-keyword>Stealth</rt-keyword> and <rt-keyword>Backstab 1</rt-keyword> this turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/assassination-protocol'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.FIRE, AFFINITIES.FIRE],
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    singleAllyMinionTargetRules.canPlay(game, card, minion => minion.manaCost <= 3) &&
    card.player.boardSide.hasEmptySpaceInBattlefield,
  getTargets: async (game, card) => {
    const minionToMove = await singleAllyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      predicate: minion => minion.manaCost <= 3,
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
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets.cards[0];
    if (!target) return;

    const destination = targets.spaces[0];
    if (!destination) return;

    await target.move(destination.position.zone, destination.position.index);

    await target.modifiers.add(
      new StealthModifier(game, card, { mixins: [new UntilEndOfTurnModifierMixin(game)] })
    );
    await target.modifiers.add(
      new BackstabModifier(game, card, {
        amount: 1,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
