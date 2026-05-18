import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleMinionTargetRules } from '../../../../card-utils';
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
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { BurnModifier } from '../../../../../modifier/modifiers/burn.modifier';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { fireBolt } from '../spells/fire-bolt';

export const pyromancer: MinionBlueprint = {
  id: 'pyromancer',
  name: 'Pyromancer',
  description: dedent /*html*/ `
  <rt-lvl-bonus lvl="2"><rt-trigger>On Turn Start</rt-trigger> Add a <rt-card>Fire Bolt</rt-card> to your hand.</rt-lvl-bonus>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinity: AFFINITIES.FIRE,
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 5,
  abilities: [
    {
      id: 'pyromancer-ability',
      label: 'Burn a minion',
      description: 'Inflict <rt-keyword>Burn 2</rt-keyword> to a minion.',
      manaCost: 1,
      canUse: (game, card) => {
        return (
          card.location === CARD_LOCATIONS.BOARD &&
          singleMinionTargetRules.canPlay(game, card)
        );
      },
      getTargets: (game, card) =>
        singleMinionTargetRules.getTargets({
          game,
          card,
          origin: { type: 'ability', abilityId: 'healing-mystic-ability', card },
          timeoutFallback: singleMinionTargetRules.defaultTimeoutFallback(game, card),
          canCancel: true,
          aiHints: {
            shouldPick: () => 1
          }
        }),
      async onResolve(game, card, targets) {
        for (const target of targets) {
          await (target as MinionCard).modifiers.add(
            new BurnModifier(game, card, { stacks: 2 })
          );
        }
      },
      aiHints: {
        shouldUse: () => 1
      }
    }
  ],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>('pyromancer-on-turn-start', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => lvlMod.isActive),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_START,
            async handler() {
              const fireBoltCard = await card.player.generateCard(
                fireBolt.id,
                card.isFoil
              );
              await fireBoltCard.addToHand();
            }
          })
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 0,
    shouldMove: () => 0,
    shouldAttack: () => 0,
    getThreatScore: () => 0
  }
};
