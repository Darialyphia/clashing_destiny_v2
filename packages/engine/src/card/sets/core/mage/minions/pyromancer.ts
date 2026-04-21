import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, defaultMinionPlaySequence } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES
} from '../../../../card.enums';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { MinionOnDestroyModifier } from '../../../../../modifier/modifiers/on-destroy.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const pyromancer: MinionBlueprint = {
  id: 'pyromancer',
  name: 'Pyromancer',
  description: dedent`
  <rt-trigger>On Enter</rt-trigger> Add a <rt-card>Fire Bolt</rt-card> to your hand.
  <rt-job-bonus>Elementalist</rt-job-bonus> Whenever you play a <rt-card>Fire Bolt</rt-card> and your <rt-card>Wheel of the Elements</rt-card> is Fire, add a <rt-card>Fire Shard</rt-card> to your hand.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.RANGED,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE.id],
  manaCost: 3,
  tags: [],
  atk: 2,
  retaliation: 1,
  maxHp: 4,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('wizard-tutor-empower', game, card, {
          mixins: [
            new TogglableModifierMixin(game, () => lvlMod.isActive),
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.TURN_START,
              unitForVisualFX: () => card.unit,
              async handler() {
                await card.player.hero.modifiers.add(
                  new EmpowerModifier(game, card, { amount: 1 })
                );
              }
            })
          ]
        })
      })
    );

    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new MinionOnDestroyModifier(game, card, {
        async handler() {
          await card.player.levelManager.gainExp(1);
        }
      })
    );
  },
  async onPlay() {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
