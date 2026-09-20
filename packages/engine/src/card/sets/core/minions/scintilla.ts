import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, emptyBoardSpaceTargetRules } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { MinionCard } from '../../../entities/minion.entity';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';

export const scintilla: MinionBlueprint = {
  id: 'scintilla',
  name: 'Scintilla',
  description: dedent /*html*/ `
  <rt-timing>Once per turn</rt-timing> When a minion scores, you may move this minion to the same location.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/scintilla'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 3,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.NEUTRAL],
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>('scintilla-move-watch', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.AFTER_SCORE,
            frequencyPerGameTurn: 1,
            filter: event => {
              return (
                event.data.card.location !== card.location &&
                emptyBoardSpaceTargetRules.canPlay(
                  game,
                  space => space.position.zone === event.data.card.location
                )
              );
            },
            handler: async event => {
              const shouldMove = await askMandatoryYesNoQuestion({
                game,
                card,
                label: 'Move Scintilla here?',
                questionId: 'move-scintilla',
                aiChoice: 'yes'
              });

              if (!shouldMove) return;
              const spaceResult = await emptyBoardSpaceTargetRules.getTargets({
                game,
                card,
                canCancel: true,
                predicate: space => space.position.zone === event.data.card.location
              });
              if (spaceResult.cancelled) return;
              const targetSpace = spaceResult.result.spaces[0]!;
              await card.moveToSpace(targetSpace);
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
