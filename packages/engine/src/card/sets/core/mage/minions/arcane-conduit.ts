import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  defaultMinionPlaySequence,
  isSpell
} from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES,
  TAGS
} from '../../../../card.enums';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { Unit } from '../../../../../unit/unit.entity';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';

export const arcaneConduit: MinionBlueprint = {
  id: 'arcane_conduit',
  name: 'Arcane Conduit',
  description: dedent`
   When you play a spell, wake up this unit.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.FLYER,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE.id],
  manaCost: 2,
  tags: [TAGS.GOLEM],
  atk: 2,
  retaliation: 0,
  maxHp: 3,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier<Unit>('arcane-conduit-on-spell', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.CARD_AFTER_PLAY,
              filter(event) {
                if (!event) return false;
                return event.data.card.isAlly(card) && isSpell(event.data.card);
              },
              async handler() {
                await card.unit.wakeUp();
              }
            })
          ]
        })
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
