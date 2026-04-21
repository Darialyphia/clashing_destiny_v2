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

export const wizardTutor: MinionBlueprint = {
  id: 'wizard-tutor',
  name: 'Wizard Tutor',
  description: dedent`
    <rt-trigger>Start of Turn</rt-trigger>: <rt-keyword>Empower 1</rt-keyword>.
    <rt-lvl-bonus lvl="3"></rt-lvl-bonus> <rt-trigger>On Destroyed</rt-trigger> Draw a <rt-mana>1</rt-mana> cost Mage spell.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.RANGED,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE.id],
  manaCost: 2,
  tags: [],
  atk: 1,
  retaliation: 0,
  maxHp: 5,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('wizard-tutor-empower', game, card, {
          mixins: [
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
          const candidates = card.player.cardManager.deck.cards.filter(
            c => c.hasJob(JOBS.MAGE.id) && c.manaCost === 1 && c.kind === CARD_KINDS.SPELL
          );
          if (candidates.length === 0) return;
          await card.player.cardManager.drawFromPool(candidates, 1);
        },
        unitMixins: [new TogglableModifierMixin(game, () => lvlMod.isActive)]
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
