import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES,
  CARD_LOCATIONS
} from '../../../card.enums';
import { ProtectorModifier } from '../../../../modifier/modifiers/protector.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import type { MinionCard } from '../../../entities/minion.entity';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';

export const swornDefender: MinionBlueprint = {
  id: 'sworn-defender',
  name: 'Sworn Defender',
  description: dedent /*html*/ `
  <rt-keyword>Protector</rt-keyword><br/>
  <rt-timing>Once per turn</rt-timing> When an ally minion moves to a battlefield, you may move me here.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/sworn-defender'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.NEUTRAL, AFFINITIES.NEUTRAL],
  manaCost: 3,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new ProtectorModifier(game, card));

    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>('sword-defender-move', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_MOVE,
            filter(event) {
              if (event.data.card.equals(card)) return false;
              if (event.data.card.isEnemy(card)) return false;
              if (event.data.to.position.zone === CARD_LOCATIONS.BASE) return false;

              return !!event.data.to.battlefield?.spaces.some(space => space.isEmpty);
            },
            frequencyPerGameTurn: 1,
            async handler(event) {
              const spaceToMove = event.data.to.battlefield?.spaces.find(
                space => space.isEmpty
              );
              if (!spaceToMove) return;

              const shouldMove = await askMandatoryYesNoQuestion({
                game,
                card,
                questionId: 'sworn-defender-move',
                label: 'Move Sworn Defender to this battlefield?',
                aiChoice: 'yes',
                timeoutFallback: 'yes'
              });

              if (shouldMove) {
                await card.moveToSpace(spaceToMove);
              }
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
