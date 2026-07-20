import dedent from 'dedent';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { WhileOnBattlefieldModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { isDefined } from '@game/shared';
import type { MinionCard } from '../../../../entities/minion.entity';
import { BurnModifier } from '../../../../../modifier/modifiers/burn.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../../modifier/modifiers/simple-commandment-modifier';

export const moltenSalamander: MinionBlueprint = {
  id: 'moltenSalamander',
  name: 'Molten Salamander',
  description: dedent /*html*/ `
  <rt-location locations="battlefield"></rt-location> At the start of the turn, inflict <rt-keyword>Burn 1</rt-keyword> to all enemies at this battlefield.
  <rt-runes runes="might,resonance,wisdom"></rt-runes>This has +1 CMD for each enemy with <rt-keyword>Burn</rt-keyword> at this battlefield.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/molten-salamander'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.TAMER],
  affinities: [AFFINITIES.FIRE],
  manaCost: 6,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>('molten-salamander', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_START,
            async handler() {
              const enemies = card
                .battlefield!.opponentSpaces.map(space => space.card)
                .filter(isDefined);
              for (const enemy of enemies) {
                await enemy?.modifiers.add(new BurnModifier(game, card, { stacks: 1 }));
              }
            }
          })
        ]
      })
    );
    await card.modifiers.add(
      new SimpleCommandmentBuffModifier('molten-salamander-cmd-buff', game, card, {
        amount() {
          if (!card.isOnBattlefield) return 0;
          return card
            .battlefield!.opponentSpaces.map(space => space.card)
            .filter(isDefined)
            .filter(enemy => enemy.modifiers.has(BurnModifier)).length;
        },
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 1,
            resonance: 1,
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
