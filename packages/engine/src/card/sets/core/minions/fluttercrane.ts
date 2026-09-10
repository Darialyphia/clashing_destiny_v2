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
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { MinionCard } from '../../../entities/minion.entity';
import { GAME_EVENTS } from '../../../../game/game.events';
import { CardEffectTriggeredEvent } from '../../../card.events';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { OnMoveModifier } from '../../../../modifier/modifiers/on-move.modifier';
import { reserve } from '../../../card-actions-utils';

export const flutterCrane: MinionBlueprint = {
  id: 'flutter-crane',
  name: 'Flutter Crane',
  description: dedent /*html*/ `
  <rt-trigger>On Move</rt-trigger> <rt-keyword>Reserve</rt-keyword> a card.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/fluttercrane'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE, AFFINITIES.NEUTRAL],
  manaCost: 3,
  manaSupply: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 0,
  maxHp: 2,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        async handler() {
          const topCard = card.player.cardManager.mainDeck.peek(1);
          await reserve(game, topCard);
        }
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
