import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  anywhereTargetRules,
  defaultCardArt,
  effectTargetRules,
  emptyBoardSpaceTargetRules,
  isSpell,
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
import { InstantModifier } from '../../../../../modifier/modifiers/instant.modifier';
import { scry } from '../../../../card-actions-utils';
import type { MinionCard } from '../../../../entities/minion.entity';
import { SpellDamage } from '../../../../../utils/damage';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { SimpleCommandmentBuffModifier } from '../../../../../modifier/modifiers/simple-commandment-modifier';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import type { SpellCard } from '../../../../entities/spell.entity';
import { SpellInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { EFFECT_TYPE } from '../../../../../game/game.enums';
import { RUNES } from '../../../../../player/player.enums';

export const arcaneSight: SpellBlueprint = {
  id: 'arcaneSight',
  name: 'Arcane Sight',
  description: dedent /*html*/ `
    <rt-keyword>Burst</rt-keyword> <rt-keyword>Scry 1</rt-keyword>, then draw a card.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit(game, card) {
    await card.modifiers.add(new InstantModifier(game, card));
  },
  async onPlay(game, card) {
    await scry(game, card, 1);
    await card.player.cardManager.draw(1);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const arcaneSpark: SpellBlueprint<MinionCard> = {
  id: 'arcaneSpark',
  name: 'Arcane Spark',
  description: dedent /*html*/ `
    Deal 1 damage to a minion then draw a card. 
    <rt-runes runes="focus,wisdom"></rt-runes> This costs 1 less.
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
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleManacostModifier('arcane-spark-discount', game, card, {
        amount: -1,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            focus: 1,
            wisdom: 1
          })
        ]
      })
    );
  },
  async onPlay(game, card, targets) {
    await targets.cards[0].takeDamage(card, new SpellDamage(1, card));
    await card.player.cardManager.draw(1);
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
  <rt-runes runes="focus,wisdom,resonance"></rt-runes>Return it to its owner's hand instead.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
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

export const fallingStar: SpellBlueprint<MinionCard> = {
  id: 'fallingStar',
  name: 'Falling Star',
  description: dedent /*html*/ `
    Give a minion -2 Commandment this turn and exhaust it.

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
    await minion.modifiers.add(
      new SimpleCommandmentBuffModifier('fallingStar', game, card, {
        amount: -2
      })
    );

    await minion.exhaust();
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const mysticRecall: SpellBlueprint<MinionCard> = {
  id: 'mysticRecall',
  name: 'Mystic Recall',
  description: dedent /*html*/ `
    Return an ally minion to its owner's hand. Draw a card.
    <rt-runes runes="wisdom,focus"></rt-runes> This is fast speed.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card, minion => minion.isAlly(card)),
  getTargets: (game, card) =>
    singleMinionTargetRules.getTargets({
      game,
      card,
      predicate: minion => minion.isAlly(card),
      aiHints: {
        shouldPick: () => 1
      },
      timeoutFallback: singleMinionTargetRules.defaultTimeoutFallback(game, card)
    }),
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<SpellCard>('mysticRecall', game, card, {
        mixins: [
          new RuneCostToggleModifierMixin(game, card, { wisdom: 1, focus: 1 }),
          new SpellInterceptorModifierMixin(game, {
            key: 'speed',
            interceptor() {
              return CARD_SPEED.FAST;
            }
          })
        ]
      })
    );
  },
  async onPlay(game, card, targets) {
    const minion = targets.cards[0];
    await minion.addToHand();

    await card.player.cardManager.draw(1);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const starConvergence: SpellBlueprint = {
  id: 'starconvergence',
  name: 'Star Convergence',
  description: dedent /*html*/ `
  Consume <rt-runes runes="resonance"></rt-runes>. Summon 2 <rt-card>Astral Ball</rt-card> exhausted.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  canPlay: (game, card) => card.player.runeManager.has({ resonance: 1 }),
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    await card.player.runeManager.remove([RUNES.RESONANCE]);

    const summonBall = async () => {
      const generatedCard = await card.player.generateCard<MinionCard>(
        'astralBall',
        card.isFoil
      );

      const hasRoom = game.boardSystem.boardSpaces.some(
        space => space.player.equals(card.player) && space.isEmpty
      );
      if (!hasRoom) return;

      const position = await emptyBoardSpaceTargetRules.getTargets({
        game,
        card,
        predicate: space => space.player.equals(card.player),
        canCancel: false
      });
      await generatedCard.playImmediatelyAt(position.result.spaces[0]);
      await generatedCard.exhaust();
    };

    await summonBall();
    await summonBall();
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const spellSiphon: SpellBlueprint = {
  id: 'spellSiphon',
  name: 'Spell Siphon',
  description: dedent /*html*/ `
    Consume <rt-runes runes="resonance"></rt-runes>. Negate the activation of a spell that costs 3 or less.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    effectTargetRules.canPlay(
      game,
      card,
      effect =>
        effect.type === EFFECT_TYPE.CARD &&
        isSpell(effect.source) &&
        effect.source.manaCost <= 3
    ) && card.player.runeManager.has({ resonance: 1 }),
  getTargets: (game, card) =>
    effectTargetRules.getTargets({
      game,
      card,
      predicate: effect =>
        effect.type === EFFECT_TYPE.CARD &&
        isSpell(effect.source) &&
        effect.source.manaCost <= 3
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const effect = targets.effect;
    if (!effect) return;
    if (!card.player.runeManager.has({ resonance: 1 })) return;
    await card.player.runeManager.remove([RUNES.RESONANCE]);
    game.effectChainSystem.currentChain?.negateEffect(effect.id);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
