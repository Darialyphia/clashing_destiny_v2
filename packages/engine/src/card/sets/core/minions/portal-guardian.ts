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
import { VigilantModifier } from '../../../../modifier/modifiers/vigilant.modifier';
import { WhileOnBaseModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import type { MinionCard } from '../../../entities/minion.entity';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';
import { CardEffectTriggeredEvent } from '../../../card.events';

export const portalGuardian: MinionBlueprint = {
  id: 'portal-guardian',
  name: 'Portal Guardian',
  description: dedent /*html*/ `
  <rt-keyword>Vigilant</rt-keyword>.
  <rt-location locations="base"></rt-location> When you summon a minion give this +1/+1/+0.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/portal-guardian'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 0,
  maxHp: 5,
  affinities: [AFFINITIES.AIR, AFFINITIES.AIR],
  commandment: 0,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new VigilantModifier(game, card));
    await card.modifiers.add(
      new WhileOnBaseModifier<MinionCard>('portal-guardian-in-base-buff', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.MINION_SUMMONED,
            filter(event) {
              return event.data.card.isAlly(card);
            },
            async handler() {
              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: 'Portal Guardian triggered its effect.'
                })
              );
              await card.modifiers.add(
                new SimpleStatsBuffModifier('portal-guardian-buff', game, card, {
                  cmd: 1,
                  atk: 1,
                  hp: 0
                })
              );
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
