import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleEnemyMinionTargetRules } from '../../../../card-utils';
import {
  JOBS,
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';

export const fallingStar: SpellBlueprint<MinionCard> = {
  id: 'fallingStar',
  name: 'Falling Star',
  description: dedent /*html*/ `
    Exhaust a minion at a battlefield. Gain 2 influence on this battlefield.

    <rt-runes runes="resonance,resonance,resonance"></rt-runes>This costs 2 less.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  tags: [],
  canPlay: (game, card) =>
    singleEnemyMinionTargetRules.canPlay(
      game,
      card,
      minion => minion.isOnBattlefield && !minion.isExhausted
    ),
  getTargets: (game, card) =>
    singleEnemyMinionTargetRules.getTargets({
      game,
      card,
      predicate: minion => minion.isOnBattlefield && !minion.isExhausted,
      aiHints: {
        shouldPick: () => 1
      },
      timeoutFallback: singleEnemyMinionTargetRules.defaultTimeoutFallback(game, card)
    }),
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleManacostModifier('fallingStar', game, card, {
        amount: -2,
        mixins: [new RuneCostToggleModifierMixin(game, card, { resonance: 3 })]
      })
    );
  },
  async onPlay(game, card, targets) {
    const minion = targets.cards[0];
    await minion.exhaust();
    await minion.battlefield?.opponentBattlefield.gainScore(2);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
