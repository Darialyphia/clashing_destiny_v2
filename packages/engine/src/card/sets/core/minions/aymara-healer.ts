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
import { ProtectorModifier } from '../../../../modifier/modifiers/protector.modifier';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { CombatDamage } from '../../../../utils/damage';
import type { MinionCard } from '../../../entities/minion.entity';

export const aymaraHealer: MinionBlueprint = {
  id: 'aymara-healer',
  name: 'Aymara Healer',
  description: dedent /*html*/ `
  <rt-keyword>Protector</rt-keyword>.
  <rt-location locations="battlefield"></rt-location> When I take combat damage, steal 1 influence here.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/aymara-healer'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  manaCost: 4,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 6,
  commandment: 2,
  affinities: [AFFINITIES.AIR, AFFINITIES.NEUTRAL],
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new ProtectorModifier(game, card));
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>(
        'aymara-healer-influence-steal',
        game,
        card,
        {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE,
              filter(event) {
                return (
                  event.data.card.equals(card) &&
                  event.data.damage instanceof CombatDamage
                );
              },
              async handler() {
                await card.battlefield?.opponentBattlefield?.loseScore(1);
                await card.battlefield?.gainScore(1);
              }
            })
          ]
        }
      )
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
