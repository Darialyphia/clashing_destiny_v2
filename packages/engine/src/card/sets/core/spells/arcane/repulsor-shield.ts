import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  singleMinionTargetRules
} from '../../../../card-utils';
import {
  JOBS,
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED,
  CARD_LOCATIONS
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';

export const repulsorShield: SpellBlueprint<MinionCard> = {
  id: 'repulsorShield',
  name: 'Repulsor Shield',
  description: dedent /*html*/ `
  Move an attacking minion to its base.
  <rt-runes runes="focus,wisdom,resonance"></rt-runes>Return it to its owner's hand instead.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder-spell'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) => {
    const minionCondition = singleMinionTargetRules.canPlay(
      game,
      card,
      minion => minion.isAttacking
    );
    if (card.player.runeManager.has({ focus: 1, wisdom: 1, resonance: 1 })) {
      return minionCondition;
    }
    return (
      minionCondition &&
      emptyBoardSpaceTargetRules.canPlay(
        game,
        space =>
          space.position.zone === CARD_LOCATIONS.BASE &&
          space.player.equals(card.player.opponent)
      )
    );
  },
  getTargets: async (game, card) => {
    return await singleMinionTargetRules.getTargets({
      game,
      card,
      predicate: minion => minion.isAttacking,
      aiHints: {
        shouldPick: () => 1
      },
      timeoutFallback: singleMinionTargetRules.defaultTimeoutFallback(game, card)
    });
  },
  async onInit() {},
  async onPlay(game, card, target) {
    const minion = target.cards[0];
    if (!card.player.runeManager.has({ focus: 1, wisdom: 1, resonance: 1 })) {
      const destination = await emptyBoardSpaceTargetRules.getTargets({
        game,
        card,
        canCancel: false,
        predicate: space =>
          space.position.zone === CARD_LOCATIONS.BASE &&
          space.player.equals(card.player.opponent)
      });
      const space = destination.result.spaces[0];
      await minion.move(space.position.zone, space.position.index);
    } else {
      await minion.addToHand();
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
