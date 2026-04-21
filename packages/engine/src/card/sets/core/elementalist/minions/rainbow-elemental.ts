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

export const rainbowElemental: MinionBlueprint = {
  id: 'rainbow_elemental',
  name: 'Rainbow Elemental',
  description: dedent`
   Depending on your current <rt-card>Wheel of the Elements</rt-card> element, this unit has:
<ul>
    <li>Fire: <rt-keyword><rt-keyword>Blast</rt-keyword></li>
    <li>Water: <rt-keyword>Elusive</rt-keyword></li>
    <li>Air: <rt-keyword>Celerity</rt-keyword></li>
    <li>Earth: <rt-keyword>Cleave</rt-keyword></li>
</ul>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.FLYER,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.ELEMENTALIST.id],
  manaCost: 5,
  tags: [TAGS.GOLEM],
  atk: 2,
  retaliation: 2,
  maxHp: 7,
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
