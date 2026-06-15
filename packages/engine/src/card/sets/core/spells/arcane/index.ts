import dedent from 'dedent';
import type { MinionBlueprint, SpellBlueprint } from '../../../../card-blueprint';
import {
  anywhereTargetRules,
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
import { BurstModifier } from '../../../../../modifier/modifiers/burst.modifier';
import { predict } from '../../../../card-actions-utils';
import type { MinionCard } from '../../../../entities/minion.entity';
import { SimplePowerBuffModifier } from '../../../../../modifier/modifiers/simple-power-buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { SpellDamage } from '../../../../../utils/damage';
import { RUNES } from '../../../../../player/player.enums';

export const arcaneSight: SpellBlueprint = {
  id: 'arcaneSight',
  name: 'Arcane Sight',
  description: dedent /*html*/ `
    <rt-keyword>Burst</rt-keyword> <rt-keyword>Predict</rt-keyword>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 0,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit(game, card) {
    await card.modifiers.add(new BurstModifier(game, card));
  },
  async onPlay(game, card) {
    await predict(game, card);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const arcaneSpark: SpellBlueprint<MinionCard> = {
  id: 'arcaneSpark',
  name: 'Arcane Spark',
  description: dedent /*html*/ `
    Give a minion -1 Power this turn. 
    <rt-runes runes="focus,wisdom"></rt-runes>Draw a card.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) => singleMinionTargetRules.canPlay(game, card),
  getTargets: (game, card) =>
    singleMinionTargetRules.getTargets({
      game,
      card,
      aiHints: {
        shouldPick: () => 1
      },
      timeoutFallback: singleMinionTargetRules.defaultTimeoutFallback(game, card)
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    await targets.cards[0].modifiers.add(
      new SimplePowerBuffModifier('arcaneSpark', game, card, {
        amount: -1,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );

    if (card.player.runeManager.has({ focus: 1, wisdom: 1 })) {
      await card.player.cardManager.draw(1);
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const repulsorShield: SpellBlueprint<MinionCard> = {
  id: 'repulsorShield',
  name: 'Repulsor Shield',
  description: dedent /*html*/ `
  Move an attacking minion to its base.
  <rt-runes runes="focus,wisdom,resonance">Return it to its owner's hand instead.</rt-runes>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
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
        space => space.position.zone === CARD_LOCATIONS.BASE
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
        predicate: space => space.position.zone === CARD_LOCATIONS.BASE
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

export const fallingStar: SpellBlueprint<MinionCard> = {
  id: 'fallingStar',
  name: 'Falling Star',
  description: dedent /*html*/ `
    Consume <rt-runes runes="resonance"></rt-runes>. Deal 1 damage to a minion at a battlefield and give it -2 Power.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card) &&
    card.player.runeManager.has({ resonance: 1 }),
  getTargets: (game, card) =>
    singleMinionTargetRules.getTargets({
      game,
      card,
      aiHints: {
        shouldPick: () => 1
      },
      timeoutFallback: singleMinionTargetRules.defaultTimeoutFallback(game, card)
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const minion = targets.cards[0];
    await card.player.runeManager.remove([RUNES.RESONANCE]);
    await minion.takeDamage(card, new SpellDamage(1, card));
    await minion.modifiers.add(
      new SimplePowerBuffModifier('fallingStar', game, card, {
        amount: -2
      })
    );
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
