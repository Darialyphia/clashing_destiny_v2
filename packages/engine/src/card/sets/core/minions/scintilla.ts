import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleMinionTargetRules } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { EmpoweredModifier } from '../../../../modifier/modifiers/empowered.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';
import { InstantMoveModifier } from '../../../../modifier/modifiers/instant-move.modifier';

export const scintilla: MinionBlueprint = {
  id: 'scintilla',
  name: 'Scintilla',
  description: dedent /*html*/ `
  While <rt-keyword>Empowered</rt-keyword>, I have +1/+1/+1 and <rt-keyword>Instant Move</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/scintilla'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  manaCost: 3,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 3,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.NEUTRAL],
  commandment: 2,
  canPlay: () => true,
  abilities: [
    {
      id: 'scintilla-empower',
      label: 'Empower Scintilla',
      description: 'Empower me.',
      manaCost: 3,
      canUse: (game, card) => !card.modifiers.has(EmpoweredModifier),
      getTargets: (game, card) =>
        singleMinionTargetRules.getTargets({
          game,
          card,
          predicate: minion => minion.equals(card),
          aiHints: {
            shouldPick: () => 1
          },
          timeoutFallback: []
        }),
      async onResolve(game, card) {
        await card.modifiers.add(new EmpoweredModifier(game, card));
      },
      aiHints: {
        shouldUse: () => 1
      }
    }
  ],
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleStatsBuffModifier('solarius-stats-buff', game, card, {
        atk: 1,
        cmd: 1,
        hp: 1,
        mixins: [
          new TogglableModifierMixin(game, () => card.modifiers.has(EmpoweredModifier))
        ]
      })
    );

    await card.modifiers.add(
      new InstantMoveModifier(game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.modifiers.has(EmpoweredModifier))
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
