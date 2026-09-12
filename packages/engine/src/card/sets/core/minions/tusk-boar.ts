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
import { GAME_EVENTS } from '../../../../game/game.events';
import { CardAfterTakeDamageEvent } from '../../../card.events';
import type { MinionCard } from '../../../entities/minion.entity';
import { Modifier } from '../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const tuskBoar: MinionBlueprint = {
  id: 'tusk-boar',
  name: 'Tusk Boar',
  description: dedent /*html*/ `
  When you deal more than 5 damage in a turn, summon this minion from your hand.
  <rt-timing>End of Turn</rt-timing>Return this to your hand.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/tusk-boar'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  affinities: [AFFINITIES.FIRE, AFFINITIES.FIRE, AFFINITIES.NEUTRAL],
  manaCost: 4,
  manaSupply: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 3,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const summonIfEligible = async () => {
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

      if (totalDamageDealt <= 5) return;
      const position = card.player.boardSide.base.find(space => space.isEmpty);
      if (!position) return;
      await card.playImmediatelyAt(position, {});
    };

    await card.modifiers.add(
      new Modifier<MinionCard>('tusk-boar-summon', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.location === CARD_LOCATIONS.HAND),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE,
            filter: event => event.data.source.isAlly(card),
            async handler() {
              await summonIfEligible();
            }
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
