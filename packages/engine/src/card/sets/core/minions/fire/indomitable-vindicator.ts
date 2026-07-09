import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { AbilityDamage } from '../../../../../utils/damage';
import { WhileOnBattlefieldModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { OnScoreModifier } from '../../../../../modifier/modifiers/on-score.modifier';
import { isDefined } from '@game/shared';

export const indomitableVindicator: MinionBlueprint = {
  id: 'indomitableVindicator',
  name: 'Indomitable Vindicator',
  description: dedent /*html*/ `
  <rt-keyword>On Score</rt-keyword> Deal 1 damage to all other minions on this battlefield.
  <rt-runes runes="might,might,resonance"></rt-runes> When another minion Scores on the same battlefield, wake up this unit.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.FIRE],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnScoreModifier(game, card, {
        async handler(event) {
          const battlefield = event.data.battlefield;
          const targets = [...battlefield.spaces, ...battlefield.opponentSpaces]
            .map(space => space.card)
            .filter(isDefined)
            .filter(isMinion)
            .filter(minion => !minion.equals(card));

          for (const target of targets) {
            await target.takeDamage(card, new AbilityDamage(1));
          }
        }
      })
    );
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>('indomitableVindicator', game, card, {
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            might: 2
          }),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.AFTER_SCORE,
            filter: event =>
              event.data.battlefield.id === card.battlefield?.id &&
              !event.data.card.equals(card),
            async handler() {
              await card.wakeUp();
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
