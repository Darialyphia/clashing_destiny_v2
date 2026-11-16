import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { GAME_EVENTS } from '../../../../game/game.events';
import { defaultCardArt } from '../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../card.enums';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { MinionCard } from '../../../entities/minion.entity';
import { CardEffectTriggeredEvent } from '../../../card.events';
import { FACTION_IDS } from '../../../factions/factions';

export const sunlionPriest: MinionBlueprint = {
  id: 'sun-lion-priest',
  name: 'Sunlion Priest',
  description: dedent /*html*/ `
  <rt-location locations="battlefield"></rt-location> When you win a round here by 3 or more influence, gain an additional Victory Point.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/war-exorcist'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  manaCost: 4,
  manaSupply: 2,
  level: 3,
  exp: 1,
  factionId: FACTION_IDS.LYONAR,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>('sun-lion-priest', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.BATTLEFIELD_SCORED,
            filter(event) {
              return (
                event.data.winner.player.equals(card.player) &&
                event.data.battledield.zone === card.location &&
                event.data.winner.score - event.data.loser.score >= 3
              );
            },
            async handler() {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: 'Sunlion Priest effect triggered'
                })
              );

              await card.player.gainVictoryPoints(1);
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
