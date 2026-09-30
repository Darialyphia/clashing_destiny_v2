import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import type { MinionCard } from '../../../entities/minion.entity';

export const unseven: MinionBlueprint = {
  id: 'unseven',
  name: 'Unseven',
  description: dedent /*html*/ `
  <rt-keyword>Attacker 2</rt-keyword>.
  <rt-timing>End of Turn</rt-timing>If I am in base or at a battlefield where you have less influence than your opponent, return me to your hand.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/unseven'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.NEUTRAL],
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>('unseven', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_END,
            filter: () => {
              if (!card.isOnBattlefield) return true;
              return (
                card.battlefield!.commandmentScore <
                card.battlefield!.opponentCommandmentScore
              );
            },
            async handler() {
              await card.addToHand();
            }
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
