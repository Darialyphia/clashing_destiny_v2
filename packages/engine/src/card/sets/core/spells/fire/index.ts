import dedent from 'dedent';
import type { SpellBlueprint, Targets } from '../../../../card-blueprint';
import {
  anywhereTargetRules,
  battlefieldTargetRules,
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  isMinion,
  multipleEnemyTargetRules,
  noTargets,
  singleAllyMinionTargetRules,
  singleEnemyMinionTargetRules,
  singleEnemyTargetRules
} from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  JOBS,
  RARITIES
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { SpellDamage } from '../../../../../utils/damage';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { JobBonusToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { askMandatoryYesNoQuestion } from '../../../../card-actions-utils';
import { RUNES } from '../../../../../player/player.enums';
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { InteractionResult } from '../../../../../game/systems/game-interaction.system';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';

export const fireBolt: SpellBlueprint<MinionCard> = {
  id: 'fireBolt',
  name: 'Fire Bolt',
  description: dedent /*html*/ `
  Deal 1 damage to an enemy minion at a battlefield.
  <rt-job-bonus job="${JOBS.MAGE.id}"><rt-runes runes="wisdom,wisdom"></rt-runes> This can also target enemy minions in base.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/fire-bolt'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    singleEnemyMinionTargetRules.canPlay(game, card, minion =>
      card.player.runeManager.has({ wisdom: 2 }) ? true : minion.isOnBattlefield
    ),
  getTargets: (game, card) =>
    singleEnemyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleEnemyTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      predicate: minion =>
        card.player.runeManager.has({ wisdom: 2 }) ? true : minion.isOnBattlefield,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(1, card));
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const cremation: SpellBlueprint = {
  id: 'cremation',
  name: 'Ceremonial Cremation',
  description: dedent /*html*/ `
  Banish 3 Fire cards from your discard pile. Draw 2 cards.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/ceremonial-cremation'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    [...card.player.cardManager.discardPile].filter(c =>
      c.affinities.includes(AFFINITIES.FIRE)
    ).length >= 3,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    const choices = [...card.player.cardManager.discardPile].filter(c =>
      c.affinities.includes(AFFINITIES.FIRE)
    );
    const cardsToBanish = await game.interaction.chooseCards({
      player: card.player,
      canCancel: false,
      minChoiceCount: 3,
      maxChoiceCount: 3,
      label: 'Choose 3 Fire cards to banish',
      choices: choices.map(c => ({
        card: c,
        aiHints: {
          shouldPick: () => (card.canPlay() ? 1 : 0.5)
        }
      })),
      timeoutFallback: choices.slice(0, 3)
    });

    for (const cardToBanish of cardsToBanish.result) {
      await cardToBanish.sendToBanishPile();
    }

    await card.player.cardManager.draw(2);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const innerFire: SpellBlueprint<MinionCard> = {
  id: 'innerFire',
  name: 'Inner Fire',
  description: dedent /*html*/ `
  Give a minion +2 Attack this turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/inner-fire'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.FIRE],
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: () => true,
  getTargets: (game, card) =>
    singleAllyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: [card.player.minions[0]],
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    await target.modifiers.add(
      new SimpleAttackBuffModifier('inner-fire', game, target, {
        amount: 2,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const fireBall: SpellBlueprint<MinionCard> = {
  id: 'fireBall',
  name: 'Fire Ball',
  description: dedent /*html*/ `
  Consume <rt-runes runes="wisdom"></rt-runes>
  Deal 4 damage to an enemy minion.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/fireball'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    card.player.runeManager.has({ wisdom: 1 }) &&
    singleEnemyMinionTargetRules.canPlay(game, card),
  getTargets: (game, card) =>
    singleEnemyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleEnemyTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    if (!card.player.runeManager.has({ wisdom: 1 })) {
      return;
    }

    await card.player.runeManager.remove([RUNES.WISDOM]);

    await target.takeDamage(card, new SpellDamage(4, card));
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const engulfInFlames: SpellBlueprint = {
  id: 'engulfInFlames',
  name: 'Engulf in Flames',
  description: dedent /*html*/ `
  <rt-job-bonus job="${JOBS.MAGE.id}">This costs 1 less</rt-job-bonus>
  Deal 1 damage to all enemy minions at a battlefield. You may consume <rt-runes runes="wisdom,resonance"></rt-runes> to deal 2 instead.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 4,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: () => true,
  getTargets: (game, card) =>
    battlefieldTargetRules.getTargets({
      game,
      card,
      predicate: ({ space }) => space.player.equals(card.player.opponent)
    }),
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleManacostModifier('engulf-in-flames-discount', game, card, {
        amount: -1,
        mixins: [new JobBonusToggleModifierMixin(game, card, JOBS.MAGE.id)]
      })
    );
  },
  async onPlay(game, card) {
    let damageAmount = 1;

    const canConsume = card.player.runeManager.has({ wisdom: 1, resonance: 1 });
    if (canConsume) {
      const shouldConsume = await askMandatoryYesNoQuestion({
        game,
        card,
        label:
          'consume <rt-runes runes="wisdom,resonance"></rt-runes> to increase damage?',
        questionId: 'engulf-in-flames-consume',
        aiChoice: 'yes',
        timeoutFallback: 'no'
      });
      if (shouldConsume) {
        damageAmount = 2;
        await card.player.runeManager.remove([RUNES.WISDOM, RUNES.RESONANCE]);
      }
    }

    const minionsToDamage = card.player.opponent.minions.filter(
      minion => minion.isOnBattlefield
    );

    for (const minion of minionsToDamage) {
      await minion.takeDamage(card, new SpellDamage(damageAmount, card));
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const lesserFireSummoning: SpellBlueprint = {
  id: 'lesserFireSummoning',
  name: 'Lesser Fire Summoning',
  description: dedent /*html*/ `
  Summon a <rt-card>Will-o-Wisp</rt-card> on a battlefield.
  <rt-runes runes="wisdom,wisdom,wisdom"></rt-runes> Give it <rt-keyword>Rush 0</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/lesser-fire-summoning'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    emptyBoardSpaceTargetRules.canPlay(
      game,
      space =>
        space.player.equals(card.player) &&
        (space.position.zone === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
          space.position.zone === CARD_LOCATIONS.RIGHT_BATTLEFIELD)
    ),
  getTargets: (game, card) =>
    emptyBoardSpaceTargetRules.getTargets({
      game,
      card,
      predicate: space =>
        space.player.equals(card.player) &&
        (space.position.zone === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
          space.position.zone === CARD_LOCATIONS.RIGHT_BATTLEFIELD),
      label: 'Select a space to summon the Willowisp'
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const minion = await card.player.generateCard<MinionCard>('willowisp', card.isFoil);
    if (card.player.runeManager.has({ wisdom: 3 })) {
      await minion.modifiers.add(new RushModifier(game, minion, { cost: 0 }));
    }
    await minion.playImmediatelyAt(targets.spaces[0]);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};

export const twinFlame: SpellBlueprint<MinionCard> = {
  id: 'twinFlame',
  name: 'Twin Flame',
  description: dedent /*html*/ `
  Deal 2 damage to 2 enemy minions on a battlefield.
  <rt-runes runes="wisdom,wisdom,resonance"></rt-runes> Deal 3 damage instead.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 5,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    multipleEnemyTargetRules.canPlay(
      game,
      card,
      2,
      card => isMinion(card) && card.isOnBattlefield
    ),
  getTargets: (game, card) =>
    multipleEnemyTargetRules.getTargets(game, card, {
      min: 2,
      max: 2,
      predicate: card => isMinion(card) && card.isOnBattlefield,
      timeoutFallback: [],
      aiHints: {
        shouldPick: () => 1
      },
      label: 'Select 2 enemy minions to deal damage to',
      allowRepeat: false
    }) as Promise<InteractionResult<Targets<MinionCard>>>,
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    const damageAmount = card.player.runeManager.has({ wisdom: 2, resonance: 1 }) ? 3 : 2;

    for (const target of targets.cards) {
      await target.takeDamage(card, new SpellDamage(damageAmount, card));
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
