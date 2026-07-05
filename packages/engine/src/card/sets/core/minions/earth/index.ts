import dedent from 'dedent';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleEnemyMinionTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { TauntModifier } from '../../../../../modifier/modifiers/taunt.modifier';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { RootedModifier } from '../../../../../modifier/modifiers/rooted.modifier';
import { VulnerableModifier } from '../../../../../modifier/modifiers/vulnerable.modifier';
import { ChannelModifier } from '../../../../../modifier/modifiers/channel.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../../modifier/modifiers/simple-commandment-modifier';
import { SimpleHealthBuffModifier } from '../../../../../modifier/modifiers/simple-health-buff.modifier';
import { FlankingModifier } from '../../../../../modifier/modifiers/flanking.modifier';
import { askMandatoryYesNoQuestion } from '../../../../card-actions-utils';
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';
import { InstantMoveModifier } from '../../../../../modifier/modifiers/instant-move.modifier';

export const mountainProtector: MinionBlueprint = {
  id: 'mountainProtector',
  name: 'Mountain Protector',
  description: dedent /*html*/ `
  <rt-keyword>Taunt</rt-keyword>
  <br/>
  <rt-runes runes="might,might,focus"></rt-runes> This costs 1 less.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.EARTH],
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new TauntModifier(game, card));
    await card.modifiers.add(
      new SimpleManacostModifier('mountain-protector', game, card, {
        amount: -1,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 2,
            focus: 1
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};

export const vineTrapper: MinionBlueprint = {
  id: 'vineTrapper',
  name: 'Vine Trapper',
  description: dedent /*html*/ `
  <rt-trigger>On Engage</rt-trigger>: Inflict <rt-keyword>Rooted</rt-keyword> to an enemy on the same battlefield until the end of the turn.
  <rt-runes runes="might,focus,resonance"></rt-runes> give it <rt-keyword>Vulnerable 1</rt-keyword> as well.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [JOBS.RANGER],
  affinities: [AFFINITIES.EARTH],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        location: 'battlefield',
        async handler() {
          const hasTarget = singleEnemyMinionTargetRules.canPlay(
            game,
            card,
            minion => minion.location === card.location
          );

          if (!hasTarget) return;
          const target = await singleEnemyMinionTargetRules.getTargets({
            game,
            card,
            canCancel: false,
            label: 'Select an enemy minion to root',
            timeoutFallback: [],
            aiHints: {
              shouldPick: () => 1
            },
            predicate: minion => minion.location === card.location
          });
          if (!target) return;
          if (target.cancelled) return;
          await target.result.cards[0]?.modifiers.add(
            new RootedModifier(game, card, {
              mixins: [new UntilEndOfTurnModifierMixin(game)]
            })
          );
          if (card.player.runeManager.has({ might: 2, focus: 1, resonance: 1 })) {
            await target.result.cards[0]?.modifiers.add(
              new VulnerableModifier(game, card, {
                amount: 1,
                mixins: [new UntilEndOfTurnModifierMixin(game)]
              })
            );
          }
        }
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};

export const impassibleMonk: MinionBlueprint = {
  id: 'impassibleMonk',
  name: 'Impassible Monk',
  description: dedent /*html*/ `
  <rt-keyword>Channel</rt-keyword>: gain +1 Commandment.
  <rt-runes runes="might,focus,wisdom"></rt-runes> +3 Health .  
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.EARTH],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 5,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new ChannelModifier(game, card, {
        async handler() {
          await card.modifiers.add(
            new SimpleCommandmentBuffModifier('impassible-monk-cmd-buff', game, card, {
              amount: 1
            })
          );
        }
      })
    );

    await card.modifiers.add(
      new SimpleHealthBuffModifier('impassible-monk-hp-buff', game, card, {
        amount: 3,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 1,
            focus: 1,
            wisdom: 1
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};

export const rockSlideGolem: MinionBlueprint = {
  id: 'rockslideGolem',
  name: 'Rockslide Golem',
  description: dedent /*html*/ `
  <rt-keyword>Taunt</rt-keyword>
  <br/>
  <rt-runes runes="might,might,focus"></rt-runes> <rt-keyword>Flanking</rt-keyword>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [],
  affinities: [AFFINITIES.EARTH],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 4,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new TauntModifier(game, card));
    await card.modifiers.add(
      new FlankingModifier(game, card, {
        amount: 1,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 1,
            focus: 1,
            resonance: 1
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};

export const terramancer: MinionBlueprint = {
  id: 'terramancer',
  name: 'Terramancer',
  description: dedent /*html*/ `
  <rt-keyword>On Engage</rt-keyword> you may pay <rt-mana>1</rt-mana> to exhaust an enemy minion on the same battlefield.
  <br/>
  <rt-runes runes="might,focus"></rt-runes> <rt-keyword>Rush 1</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.EARTH],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        location: 'battlefield',
        async handler() {
          if (card.player.manaManager.mana < 1) return;
          const hasTarget = singleEnemyMinionTargetRules.canPlay(
            game,
            card,
            minion => minion.location === card.location
          );

          if (!hasTarget) return;

          const shouldPay = await askMandatoryYesNoQuestion({
            game,
            card,
            questionId: 'terramancer',
            label: 'Pay 1 mana to exhaust an enemy minion on the same battlefield?',
            aiChoice: 'yes',
            timeoutFallback: 'no'
          });

          if (!shouldPay) return;

          const target = await singleEnemyMinionTargetRules.getTargets({
            game,
            card,
            canCancel: false,
            label: 'Select an enemy minion to root',
            timeoutFallback: [],
            aiHints: {
              shouldPick: () => 1
            },
            predicate: minion => minion.location === card.location
          });

          if (!target) return;
          if (target.cancelled) return;

          await target.result.cards[0]?.exhaust();
        }
      })
    );

    await card.modifiers.add(
      new RushModifier(game, card, {
        cost: 1,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 1,
            focus: 1
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
