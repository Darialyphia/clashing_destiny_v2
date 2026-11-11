import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleEnemyMinionTargetRules } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES,
  CARD_LOCATIONS
} from '../../../card.enums';
import { ChannelModifier } from '../../../../modifier/modifiers/channel.modifier';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { EmpoweredModifier } from '../../../../modifier/modifiers/empowered.modifier';
import { OnMoveModifier } from '../../../../modifier/modifiers/on-move.modifier';

export const pyromancer: MinionBlueprint = {
  id: 'pyromancer',
  name: 'Pyromancer',
  description: dedent /*html*/ `
  <rt-location locations="base"></rt-location> <rt-keyword>Channel</rt-keyword> <rt-keyword>Empower me</rt-keyword>.
  While empowered, I have <rt-trigger>On Engage</rt-trigger> Inflict <rt-keyword>Burn 2</rt-keyword> to an enemy minion.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/pyromancer'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 2,
  affinities: [AFFINITIES.AIR],
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new ChannelModifier('pyromancer-burn', game, card, {
        async handler() {
          if (!card.modifiers.has(EmpoweredModifier)) return;
          await card.modifiers.add(new EmpoweredModifier(game, card));
        },
        mixins: [
          new TogglableModifierMixin(game, () => card.location === CARD_LOCATIONS.BASE)
        ]
      })
    );

    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        location: 'battlefield',
        async handler() {
          const hasTarget = singleEnemyMinionTargetRules.canPlay(game, card);
          if (!hasTarget) return;

          const targetResult = await singleEnemyMinionTargetRules.getTargets({
            game,
            card,
            canCancel: false,
            label: 'Select an enemy minion to burn',
            timeoutFallback: singleEnemyMinionTargetRules.defaultTimeoutFallback(
              game,
              card
            ),
            aiHints: {
              shouldPick: () => 1
            }
          });

          if (targetResult.cancelled) return;
          const target = targetResult.result.cards[0];
          if (!target) return;
          await target.modifiers.add(new BurnModifier(game, card, { stacks: 2 }));
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
