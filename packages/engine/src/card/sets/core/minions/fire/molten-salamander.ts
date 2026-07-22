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
import { isDefined } from '@game/shared';
import { BurnModifier } from '../../../../../modifier/modifiers/burn.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../../modifier/modifiers/simple-commandment-modifier';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import { FlankingModifier } from '../../../../../modifier/modifiers/flanking.modifier';

export const moltenSalamander: MinionBlueprint = {
  id: 'moltenSalamander',
  name: 'Molten Salamander',
  description: dedent /*html*/ `
  <rt-keyword>Flanking</rt-keyword><br/>
  <rt-trigger>On Move</rt-trigger> Inflict <rt-keyword>Burn 1</rt-keyword> to all enemies at this battlefield.
  <rt-runes runes="might,resonance,wisdom"></rt-runes>This has +0/+0/+1 for each enemy with <rt-keyword>Burn</rt-keyword> at this battlefield.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/molten-salamander'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.TAMER],
  affinities: [AFFINITIES.FIRE],
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new FlankingModifier(game, card));
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        async handler() {
          if (!card.isOnBattlefield) return;

          const enemies = card
            .battlefield!.opponentSpaces.map(space => space.card)
            .filter(isDefined);
          for (const enemy of enemies) {
            await enemy?.modifiers.add(new BurnModifier(game, card, { stacks: 1 }));
          }
        }
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
