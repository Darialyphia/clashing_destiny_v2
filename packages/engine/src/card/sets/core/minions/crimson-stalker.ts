import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { MinionCard } from '../../../entities/minion.entity';
import { GAME_EVENTS } from '../../../../game/game.events';
import { CardEffectTriggeredEvent } from '../../../card.events';
import { EmpoweredModifier } from '../../../../modifier/modifiers/empowered.modifier';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { IntimidateModifier } from '../../../../modifier/modifiers/intimidate.modifier';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';
import { StealthModifier } from '../../../../modifier/modifiers/stealth.modifier';

export const crimsonStalker: MinionBlueprint = {
  id: 'crimson-stalker',
  name: 'Crimson Stalker',
  description: dedent /*html*/ `
  <rt-keyword>Stealth</rt-keyword>.
  While ready, when an enemy minion moves on a battlefield, you may pay <rt-mana>1</rt-mana> to move me in front of it.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/crimson-stalker'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE],
  manaCost: 3,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new StealthModifier(game, card));
    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>('crimson-stalker', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_MOVE,
            frequencyPerGameTurn: 1,
            filter(event) {
              return (
                !card.isExhausted &&
                isMinion(event.data.card) &&
                event.data.card.isEnemy(card) &&
                !!event.data.card.position?.inFront?.isEmpty &&
                card.player.canSpendMana(1)
              );
            },
            async handler(event) {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: 'Crimson Stalker effect triggered.'
                })
              );

              const shouldMove = await askMandatoryYesNoQuestion({
                game,
                card,
                questionId: 'crimson-stalker-move',
                aiChoice: 'yes',
                label:
                  'Pay <rt-mana>1</rt-mana> to move Crimson Stalker in front of the enemy minion ?'
              });

              if (!shouldMove) return;
              await card.player.spendMana(1);
              await card.moveToSpace(event.data.card.position!.inFront!);
            }
          })
        ]
      })
    );

    await card.modifiers.add(
      new SimpleStatsBuffModifier('chakri-avatar-empowered-buff', game, card, {
        atk: 2,
        hp: 1,
        cmd: 2,
        mixins: [
          new TogglableModifierMixin(game, () => card.modifiers.has(EmpoweredModifier))
        ]
      })
    );

    await card.modifiers.add(
      new IntimidateModifier(game, card, {
        level: 2,
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
