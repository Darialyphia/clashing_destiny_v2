import dedent from 'dedent';
import {
  RuneCostToggleModifierMixin,
  TogglableModifierMixin
} from '../../../../../modifier/mixins/togglable.mixin';
import { AttackerModifier } from '../../../../../modifier/modifiers/attacker.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  isSpell,
  noTargets
} from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { askMandatoryYesNoQuestion, scry } from '../../../../card-actions-utils';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { WhileOnBattlefieldModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import type { MinionCard } from '../../../../entities/minion.entity';
import { RUNES } from '../../../../../player/player.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import { StealthModifier } from '../../../../../modifier/modifiers/stealth.modifier';
import { InstantAttackModifier } from '../../../../../modifier/modifiers/instant-attack.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../../modifier/modifiers/simple-commandment-modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';

export const starSeer: MinionBlueprint = {
  id: 'starSeer',
  name: 'Star Seer',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger> <rt-keyword>Scry 2</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          await scry(game, card, 2);
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

export const manaWeaverApprentice: MinionBlueprint = {
  id: 'manaWeaverApprentice',
  name: 'Mana Weaver Apprentice',
  description: dedent /*html*/ `
    I have +1 Commandment if you have played 2 or more spells this turn.
    <rt-runes runes="wisdom,focus,focus"></rt-runes> <rt-keyword>Stealth</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 4,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new AttackerModifier(game, card, {
        amount: 3,
        mixins: [
          new TogglableModifierMixin(
            game,
            () =>
              card.player.cardTracker.getCardsPlayedThisTurnOfKind(CARD_KINDS.SPELL)
                .length >= 2
          )
        ]
      })
    );

    await card.modifiers.add(
      new StealthModifier(game, card, {
        mixins: [new RuneCostToggleModifierMixin(game, card, { wisdom: 1, focus: 2 })]
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

export const manaFueledGolem: MinionBlueprint = {
  id: 'manaFueledGolem',
  name: 'Mana-fueled Golem',
  description: dedent /*html*/ `
    At the start of your turn, you may pay 1 mana. If you don't, exhaust this minion and give it -2 Commandment this turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 5,
  commandment: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<MinionCard>('mana-fueled-golem', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_START,
            handler: async () => {
              const answer = await askMandatoryYesNoQuestion({
                game,
                card,
                questionId: 'manaPayment',
                label:
                  'Pay 1 mana to avoid exhausting this minion and giving it -2 Commandment this turn?',
                timeoutFallback: 'yes',
                aiChoice: 'yes'
              });
              if (answer) return;
              await card.exhaust();
              await card.modifiers.add(
                new SimpleCommandmentBuffModifier(
                  'mana-fueled-golem-debuff',
                  game,
                  card,
                  {
                    amount: -2,
                    mixins: [new UntilEndOfTurnModifierMixin(game)]
                  }
                )
              );
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

export const erinasApprentice: MinionBlueprint = {
  id: 'erinasApprentice',
  name: "Erina's Apprentice",
  description: dedent /*html*/ `
    <rt-trigger>On Enter</rt-trigger> Draw a spell. You may consume <rt-runes runes="wisdom"></rt-runes> to reduce its cost by 1.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 2,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const [drawnCard] = await card.player.cardManager.drawWithFilter(1, isSpell);
          if (!drawnCard) return;

          const canPay = card.player.runeManager.has({ wisdom: 1 });
          if (!canPay) return;

          const answer = await askMandatoryYesNoQuestion({
            game,
            card: drawnCard,
            questionId: 'manaReduction',
            label: 'Consume 1 Wisdom Rune to reduce the cost of this card by 1?',
            timeoutFallback: 'no',
            aiChoice: 'yes'
          });

          if (answer) {
            await card.player.runeManager.remove([RUNES.WISDOM]);
            await drawnCard.modifiers.add(
              new SimpleManacostModifier('erinasApprentice', game, card, { amount: -1 })
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

export const enigmaticWizard: MinionBlueprint = {
  id: 'enigmaticWizard',
  name: 'Enigmatic Wizard',
  description: dedent /*html*/ `
    <rt-location locations="battlefield"><rt-trigger>Start of Turn</rt-trigger> Put an Arcane Spark in your hand.
    </rt-location>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 4,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>('enigmaticWizard', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_START,
            handler: async () => {
              const generatedCard = await card.player.generateCard(
                'arcaneSpark',
                card.isFoil
              );
              await generatedCard.addToHand();
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

export const astralBall: MinionBlueprint = {
  id: 'astralBall',
  name: 'Astral Ball',
  description: dedent /*html*/ ``,
  collectable: false,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/astral-ball'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  jobs: [],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 0,
  maxHp: 1,
  commandment: 1,
  canPlay: () => true,
  abilities: [
    {
      id: 'astralBallAbility',
      label: 'Scry 1',
      description: 'Sacrifice this unit to <rt-keyword>Scry 1</rt-keyword>.',
      canUse: () => true,
      getTargets: noTargets,
      manaCost: 0,
      shouldExhaust: true,
      onResolve: async (game, card) => {
        await card.destroy(card);
        await scry(game, card, 1);
      },
      aiHints: {
        shouldUse: () => 0
      }
    }
  ],
  async onInit() {},
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};

export const astralSage: MinionBlueprint = {
  id: 'astralSage',
  name: 'Astral Sage',
  description: dedent /*html*/ `
    <rt-trigger>On Enter</rt-trigger> and <rt-trigger>On Move</rt-trigger> Summon an <rt-card>Astral Ball</rt-card> in your base exhausted.
    if you control at least 3 <rt-card>Astral Ball</rt-card>, this has <rt-keyword>Instant Attack</rt-keyword> ans +1 Attack.
    <rt-runes runes="wisdom,focus,focus"></rt-runes> This costs 1 less.
    `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/astral-sage'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 6,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 6,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const summonAstralBall = async () => {
      const generatedCard = await card.player.generateCard<MinionCard>(
        'astralBall',
        card.isFoil
      );
      const hasRoomInBase = card.player.boardSide.base.some(space => space.isEmpty);
      if (!hasRoomInBase) return;

      const position = await emptyBoardSpaceTargetRules.getTargets({
        game,
        card,
        predicate: space => space.position.zone === CARD_LOCATIONS.BASE,
        canCancel: false
      });
      await generatedCard.playImmediatelyAt(position.result.spaces[0]);
      await generatedCard.exhaust();
    };

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: summonAstralBall
      })
    );

    await card.modifiers.add(
      new OnMoveModifier(game, card, { handler: summonAstralBall })
    );

    await card.modifiers.add(
      new SimpleManacostModifier('astralSage', game, card, {
        amount: -1,
        mixins: [new RuneCostToggleModifierMixin(game, card, { wisdom: 1, focus: 2 })]
      })
    );

    const astralBallThresholdMixin = () =>
      new TogglableModifierMixin(
        game,
        () =>
          card.player.minions.filter(minion => minion.blueprint.id === 'astralBall')
            .length >= 3
      );
    await card.modifiers.add(
      new InstantAttackModifier(game, card, {
        mixins: [astralBallThresholdMixin()]
      })
    );

    await card.modifiers.add(
      new SimpleAttackBuffModifier<MinionCard>('astralSage-atk-buff', game, card, {
        amount: 1,
        mixins: [astralBallThresholdMixin()]
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
