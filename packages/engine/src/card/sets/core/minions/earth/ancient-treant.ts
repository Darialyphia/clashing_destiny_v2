import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  isMinion,
  singleAllyMinionTargetRules
} from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import { RootedModifier } from '../../../../../modifier/modifiers/rooted.modifier';
import { DurationModifierMixin } from '../../../../../modifier/mixins/duration.mixin';
import { RUNES } from '../../../../../player/player.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { CardAuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { WhileOnBattlefieldModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { MinionCard } from '../../../../entities/minion.entity';
import { MinionInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';

export const ancientTreant: MinionBlueprint = {
  id: 'ancientTreant',
  name: 'Ancient Treant',
  description: dedent /*html*/ `
  <rt-trigger>On Move</rt-trigger> This units gains <rt-keyword>Rooted</rt-keyword> until the end of the next turn.
  Enemy minions on the same battlefield as this unit cannot score.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  jobs: [JOBS.TAMER],
  affinities: [AFFINITIES.EARTH],
  manaCost: 7,
  runeCost: [RUNES.FOCUS, RUNES.WISDOM],
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 7,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        async handler() {
          await card.modifiers.add(
            new RootedModifier(game, card, {
              mixins: [new DurationModifierMixin(game, 2)]
            })
          );
        }
      })
    );

    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>('ancient-treant', game, card, {
        mixins: [
          new CardAuraModifierMixin<MinionCard>(game, card, {
            isElligible(candidate) {
              return (
                isMinion(candidate) &&
                candidate.isEnemy(card) &&
                candidate.location === card.location
              );
            },
            getModifiers() {
              return [
                new Modifier('ancient-treant-aura', game, card, {
                  mixins: [
                    new MinionInterceptorModifierMixin(game, {
                      key: 'canScore',
                      interceptor: () => false
                    })
                  ]
                })
              ];
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
