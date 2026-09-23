import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isSpell } from '../../../card-utils';
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

export const chakriAvatar: MinionBlueprint = {
  id: 'chakri-avatar',
  name: 'Chakri Avatar',
  description: dedent /*html*/ `
  When I see you play 2 spells in a turn, <rt-keyword>Empower</rt-keyword> me.
  While <rt-keyword>Empowered</rt-keyword>, I have +2/+2/+1 and <rt-keyword>Intimidate 2</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/chakri_avatar'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>('chakri_avatar', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            frequencyPerGameTurn: 1,
            filter(event) {
              return (
                isSpell(event.data.card) &&
                event.data.card.isAlly(card) &&
                card.player.cardTracker.getCardsPlayedThisTurnOfKind(CARD_KINDS.SPELL)
                  .length === 2
              );
            },
            async handler() {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: 'Chakri Avatar effect triggered.'
                })
              );

              await card.modifiers.add(new EmpoweredModifier(game, card));
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
