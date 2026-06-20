import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  isMinion,
  isSpell,
  singleEnemyMinionTargetRules
} from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';
import { AttackerModifier } from '../../../../../modifier/modifiers/attacker.modifier';
import { BlastModifier } from '../../../../../modifier/modifiers/blast.modifier';
import { FlankingModifier } from '../../../../../modifier/modifiers/flanking.modifier';
import {
  askMandatoryYesNoQuestion,
  discardFromHand
} from '../../../../card-actions-utils';
import { AbilityDamage } from '../../../../../utils/damage';
import { RUNES } from '../../../../../player/player.enums';
import { WhileOnBattlefieldModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { CardEffectTriggeredEvent } from '../../../../card.events';
import { OnAttackModifier } from '../../../../../modifier/modifiers/on-attack.modifier';
import { OnKillModifier } from '../../../../../modifier/modifiers/on-kill.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../../modifier/modifiers/simple-commandment-modifier';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import { RemoveOnDestroyedMixin } from '../../../../../modifier/mixins/remove-on-destroyed';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { SimpleHealthBuffModifier } from '../../../../../modifier/modifiers/simple-health-buff.modifier';

export const pyromancer: MinionBlueprint = {
  id: 'pyromancer',
  name: 'Pyromancer',
  description: dedent /*html*/ `
  <rt-trigger>On Attack</rt-trigger> You may deal 1 damage to an enemy on the same battlefield as this.
  <rt-runes runes="wisdom,might"></rt-runes> <rt-trigger>On Kill</rt-trigger> this gains +1 Commandment.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/pyromancer'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
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
      new OnAttackModifier(game, card, {
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
            canCancel: true,
            label: 'Select an enemy minion to deal 1 damage to',
            timeoutFallback: [],
            aiHints: {
              shouldPick: () => 1
            },
            predicate: minion => minion.location === card.location
          });
          if (!target) return;
          if (target.cancelled) return;

          await target.result.cards[0]?.takeDamage(card, new AbilityDamage(1));
        }
      })
    );

    await card.modifiers.add(
      new OnKillModifier(game, card, {
        async handler() {
          await card.modifiers.add(
            new SimpleCommandmentBuffModifier('pyromancer-commandment-buff', game, card, {
              amount: 1
            })
          );
        },
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            wisdom: 1,
            might: 1
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

export const recklessRecruit: MinionBlueprint = {
  id: 'recklessRecruit',
  name: 'Reckless Recruit',
  description: dedent /*html*/ `
  <rt-keyword>Rush 1</rt-keyword> <rt-keyword><rt-runes runes="might,might,might"></rt-runes> Attacker 2</rt-keyword>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new RushModifier(game, card, { cost: 1 }));
    await card.modifiers.add(
      new AttackerModifier(game, card, {
        amount: 2,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 3
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

export const willowisp: MinionBlueprint = {
  id: 'willowisp',
  name: 'Will-o-Wisp',
  description: dedent /*html*/ `<rt-keyword>Blast 1</rt-keyword>`,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [],
  affinities: [AFFINITIES.FIRE],
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 1,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new BlastModifier(game, card, { amount: 1 }));
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};

export const fireImp: MinionBlueprint = {
  id: 'fireImp',
  name: 'Fire Imp',
  description: dedent /*html*/ `
  <rt-trigger>On Move</rt-trigger> Discard a card, then draw a card.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/fire-imp'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [],
  affinities: [AFFINITIES.FIRE],
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 1,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        async handler() {
          if (card.player.cardManager.hand.length === 0) return;
          await discardFromHand(game, card, { min: 1, max: 1 });
          await card.player.cardManager.draw(1);
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

export const flameArchmage: MinionBlueprint = {
  id: 'flameArchmage',
  name: 'Flame Archmage',
  description: dedent /*html*/ `
  <rt-location locations="battlefield">After you play a Fire spell, you may consume <rt-runes runes="wisdom"></rt-runes> to deal 2 damage to a minion.
  </rt-location>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/flame-archmage'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 5,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>('flameArchmage', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            filter: event =>
              event.data.card.player.equals(card.player) &&
              isSpell(event.data.card) &&
              event.data.card.affinities.includes(AFFINITIES.FIRE),
            async handler() {
              if (!card.player.runeManager.has({ wisdom: 1 })) return;

              const hasTarget = singleEnemyMinionTargetRules.canPlay(game, card);
              if (!hasTarget) return;

              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: `Flame Archmage effect triggered.`
                })
              );
              const shouldActivate = await askMandatoryYesNoQuestion({
                game,
                card,
                questionId: 'flameArchmage-activation',
                label: 'Consume 1 Wisdom rune to deal 2 damage to a minion?',
                aiChoice: 'yes',
                timeoutFallback: 'no'
              });

              if (!shouldActivate) return;

              const { result: target } = await singleEnemyMinionTargetRules.getTargets({
                game,
                card,
                label: 'Select an enemy minion to deal 2 damage to',
                timeoutFallback: singleEnemyMinionTargetRules.defaultTimeoutFallback(
                  game,
                  card
                ),
                aiHints: {
                  shouldPick: () => 1
                }
              });

              if (!target) return;
              const [minionTarget] = target.cards;

              if (!minionTarget) return;

              await card.player.runeManager.remove([RUNES.WISDOM]);
              await minionTarget.takeDamage(card, new AbilityDamage(2));
            }
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

export const indomitableVindicator: MinionBlueprint = {
  id: 'indomitableVindicator',
  name: 'Indomitable Vindicator',
  description: dedent /*html*/ `
  <rt-location locations="battlefield">The first minion you play each turn has <rt-keyword>Rush 1</rt-keyword>.
  </rt-location>

  <rt-runes runes="might,might,focus"></rt-runes> This gains +1 Attack and +1 Health.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.FIRE],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>('indomitableVindicator', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_BEFORE_PLAY,
            frequencyPerGameTurn: 1,
            filter: event =>
              event.data.card.player.equals(card.player) && isMinion(event.data.card),
            async handler(event) {
              await event.data.card.modifiers.add(
                new RushModifier(game, card, {
                  cost: 1,
                  mixins: [new RemoveOnDestroyedMixin(game)]
                })
              );
            }
          })
        ]
      })
    );

    await card.modifiers.add(
      new SimpleAttackBuffModifier('indomitableVindicator-attack-buff', game, card, {
        amount: 1,
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 2,
            focus: 1
          })
        ]
      })
    );

    await card.modifiers.add(
      new SimpleHealthBuffModifier('indomitableVindicator-health-buff', game, card, {
        amount: 1,
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
