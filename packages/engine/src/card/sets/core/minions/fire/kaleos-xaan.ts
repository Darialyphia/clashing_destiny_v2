import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, isSpell } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../../card.enums';
import { StealthModifier } from '../../../../../modifier/modifiers/stealth.modifier';
import { FlankingModifier } from '../../../../../modifier/modifiers/flanking.modifier';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import type { MinionCard } from '../../../../entities/minion.entity';
import { InstantMoveModifier } from '../../../../../modifier/modifiers/instant-move.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { InstantAttackModifier } from '../../../../../modifier/modifiers/instant-attack.modifier';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { CardEffectTriggeredEvent } from '../../../../card.events';

export const kaleosXaan: MinionBlueprint = {
  id: 'kaleos-xaan',
  name: 'Kaleos Xaan',
  description: dedent /*html*/ `
  <rt-keyword>Stealth</rt-keyword>, <rt-keyword>Flanking</rt-keyword>.
  <rt-timing>Once per turn</rt-timing>When you play a Spell, wake up this minion.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/kaleos-xaan'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  affinities: [AFFINITIES.FIRE, AFFINITIES.FIRE, AFFINITIES.FIRE],
  manaCost: 6,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new StealthModifier(game, card));
    await card.modifiers.add(new FlankingModifier(game, card));

    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>('kaleos-spell-trigger', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            filter: event => event.data.card.isAlly(card) && isSpell(event.data.card),
            frequencyPerGameTurn: 1,
            async handler() {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({ card, message: 'Kaleos Xaan wakes up!' })
              );
              await card.wakeUp();
              card.resetManualMovement();
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
