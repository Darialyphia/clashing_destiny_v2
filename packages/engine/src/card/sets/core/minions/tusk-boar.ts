import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import { InstantMoveModifier } from '../../../../modifier/modifiers/instant-move.modifier';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { OverwhelmModifier } from '../../../../modifier/modifiers/overwhelm.modifier';
import { GAME_EVENTS } from '../../../../game/game.events';
import { CardAfterTakeDamageEvent } from '../../../card.events';
import type { MinionCard } from '../../../entities/minion.entity';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import type { AnyCard } from '../../../entities/card.entity';
import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';

const getTotalDamageDealtThisTurn = (card: AnyCard) => {
  const totalDamageDealt = card.player.eventTracker
    .getEventsThisGameTurnByName(GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE)
    .filter(event => {
      const damageEvent = event.data.event as CardAfterTakeDamageEvent;
      return damageEvent.data.source.isAlly(card);
    })
    .reduce((total, event) => {
      const damageEvent = event.data.event as CardAfterTakeDamageEvent;
      return total + damageEvent.data.damage.getFinalAmount(damageEvent.data.card);
    }, 0);
  return totalDamageDealt;
};

export const tuskBoar: MinionBlueprint = {
  id: 'tusk-boar',
  name: 'Tusk Boar',
  description: dedent /*html*/ `
  <rt-keyword>Overwhelm</rt-keyword>, <rt-keyword>Instant Move</rt-keyword>
  This costs 0 if you have dealt 4 or more damage this turn.
  <rt-timing>End of Turn</rt-timing>Return this to your hand.
  `,
  dynamicDescription(game, card) {
    const totalDamageDealt = getTotalDamageDealtThisTurn(card);
    return dedent /*html*/ `
  <rt-keyword>Overwhelm</rt-keyword>, <rt-keyword>Instant Move</rt-keyword>.
  I cost 0 if you have dealt (${Math.max(0, 4 - totalDamageDealt)} left!) or more damage this turn.
  <rt-timing>End of Turn</rt-timing>Return me to your hand.
    `;
  },
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/tusk-boar'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  affinities: [AFFINITIES.FIRE, AFFINITIES.FIRE],
  manaCost: 3,
  manaSupply: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new OverwhelmModifier(game, card));
    await card.modifiers.add(new InstantMoveModifier(game, card));
    await card.modifiers.add(
      new Modifier('tusk-boar-discount', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => getTotalDamageDealtThisTurn(card) >= 4),
          new MinionInterceptorModifierMixin(game, {
            key: 'manaCost',
            interceptor: () => 0
          })
        ]
      })
    );
    await card.modifiers.add(
      new Modifier<MinionCard>('tusk-boar-bounce', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_END,
            async handler() {
              if (!card.isOnBoard) return;
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
