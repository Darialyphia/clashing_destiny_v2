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
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { MinionOnDestroyModifier } from '../../../../../modifier/modifiers/on-destroy.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { UnitSimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';

export const apprenticeMagician: MinionBlueprint = {
  id: 'apprentice-magician',
  name: 'Apprentice Magician',
  description: dedent`
  <rt-keyword>Shooter</rt-keyword>
   Whenever you play a spell, gain +1 Attack this turn.
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
  retaliation: 1,
  maxHp: 3,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('wizard-tutor-empower', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.CARD_AFTER_PLAY,
              filter(event) {
                return (
                  event?.data.card.kind === CARD_KINDS.SPELL &&
                  event.data.card.player.equals(card.player)
                );
              },
              async handler() {
                await card.unit.modifiers.add(
                  new UnitSimpleAttackBuffModifier(
                    'apprentice-magician-buff',
                    game,
                    card,
                    { amount: 1 }
                  )
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
