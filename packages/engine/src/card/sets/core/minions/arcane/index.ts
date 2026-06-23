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
  noTargets,
  singleAllyMinionTargetRules
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
import { CardAuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import type { Player } from '../../../../../player/player.entity';
import { EchoModifier } from '../../../../../modifier/modifiers/echo.modifier';
import { UntilEventModifierMixin } from '../../../../../modifier/mixins/until-event';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import { StealthModifier } from '../../../../../modifier/modifiers/stealth.modifier';

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
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  jobs: [],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
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
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 6,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 6,
  commandment: 2,
  canPlay: () => true,
  abilities: [
    {
      id: 'astralSageAbility',
      label: 'Give next spell Echo',
      /*html*/
      description: `Sacrifice an <rt-card>Astral Ball</rt-card>: give the next spell you play this turn has <rt-keyword>Echo</rt-keyword>`,
      canUse: (game, card) =>
        singleAllyMinionTargetRules.canPlay(
          game,
          card,
          minion => minion.blueprintId === 'astralBall'
        ),
      getTargets(game, card) {
        return singleAllyMinionTargetRules.getTargets({
          game,
          card,
          timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(
            game,
            card,
            minion => minion.blueprintId === 'astralBall'
          ),
          predicate: minion => {
            return minion.blueprintId === 'astralBall';
          },
          aiHints: {
            shouldPick: () => 1
          }
        });
      },
      manaCost: 0,
      shouldExhaust: true,
      async onResolve(game, card, targets) {
        const target = targets.cards[0] as MinionCard;
        await target.destroy(card);
        await card.player.modifiers.add(
          new Modifier<Player>('astralSageEcho', game, card, {
            mixins: [
              new CardAuraModifierMixin(game, card, {
                isElligible(candidate) {
                  return isSpell(candidate) && candidate.player.equals(card.player);
                },
                getModifiers(candidate) {
                  return [
                    new EchoModifier(game, card, {
                      mixins: [
                        new UntilEventModifierMixin(game, {
                          eventName: GAME_EVENTS.CARD_AFTER_PLAY,
                          filter(event) {
                            return event.data.card.equals(candidate);
                          }
                        })
                      ]
                    })
                  ];
                }
              }),
              new UntilEventModifierMixin(game, {
                eventName: GAME_EVENTS.CARD_AFTER_PLAY,
                filter(event) {
                  return (
                    isSpell(event.data.card) && event.data.card.player.equals(card.player)
                  );
                }
              })
            ]
          })
        );
      },
      aiHints: {
        shouldUse: () => 0
      }
    }
  ],

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
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
