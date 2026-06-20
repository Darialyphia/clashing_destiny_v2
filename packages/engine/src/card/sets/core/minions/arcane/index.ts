import dedent from 'dedent';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { AttackerModifier } from '../../../../../modifier/modifiers/attacker.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, isSpell, noTargets } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { askMandatoryYesNoQuestion, scry } from '../../../../card-actions-utils';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { WhileOnBattlefieldModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import type { MinionCard } from '../../../../entities/minion.entity';
import { RUNES } from '../../../../../player/player.enums';

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
  atk: 2,
  maxHp: 3,
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
    At the start of your turn, you may pay 1 mana. If you don't, exhaust this minion.
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
      new AttackerModifier(game, card, {
        amount: 3,
        mixins: [
          new TogglableModifierMixin(
            game,
            () =>
              card.player.cardTracker.getCardsPlayedThisTurnOfKind(CARD_KINDS.SPELL)
                .length >= 3
          )
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
    <rt-trigger>On Enter</rt-trigger> <rt-keyword>Draw a spell</rt-keyword>. You may consume <rt-runes runes="wisdom"></rt-runes> to reduce its cost by 1.
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
  maxHp: 3,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const [drawnCard] = await card.player.cardManager.drawWithFilter(1, isSpell);
          if (!drawnCard) return;

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
  atk: 4,
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
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 1,
  commandment: 1,
  canPlay: () => true,
  abilities: [
    {
      id: 'astralBallAbility',
      label: 'Scry 2',
      description: 'Sacrifice this unit: <rt-keyword>Scry 2</rt-keyword>',
      canUse: () => true,
      getTargets: noTargets,
      manaCost: 0,
      shoouldExhaust: true,
      onResolve: async (game, card) => {
        await scry(game, card, 2);
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
