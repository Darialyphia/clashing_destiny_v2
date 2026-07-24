import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, emptyBoardSpaceTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { RUNES } from '../../../../../player/player.enums';
import { FlankingModifier } from '../../../../../modifier/modifiers/flanking.modifier';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { CardAuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { astralBall } from './astral-ball';
import { SimpleCommandmentBuffModifier } from '../../../../../modifier/modifiers/simple-commandment-modifier';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import type { AnyCard } from '../../../../entities/card.entity';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { UniqueModifier } from '../../../../../modifier/modifiers/unique.modifier';

export const cosmicAvatar: MinionBlueprint = {
  id: 'cosmicAvatar',
  name: 'Cosmic Avatar',
  description: dedent /*html*/ `
  <rt-keyword>Flanking</rt-keyword> <rt-keyword>Unique</rt-keyword>
  Your <rt-card>Astral Ball</rt-card> have +1/+1/+0.
  Once per turn, when an <rt-card>Astral Ball</rt-card> you control deals combat damage, wake up this card.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/cosmic-avatar'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 6,
  runeCost: [RUNES.WISDOM, RUNES.RESONANCE],
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 6,
  commandment: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new UniqueModifier(game, card));
    await card.modifiers.add(new FlankingModifier(game, card));

    const isAlliedAstralBall = (candidate: AnyCard) =>
      candidate.blueprintId === astralBall.id && candidate.isAlly(card);

    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>('cosmic-avatar-aura', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return isAlliedAstralBall(candidate);
            },
            getModifiers() {
              return [
                new SimpleAttackBuffModifier('cosmic-avatar-aura-atk-buff', game, card, {
                  amount: 1
                }),
                new SimpleCommandmentBuffModifier(
                  'cosmic-avatar-aura-cmd-buff',
                  game,
                  card,
                  { amount: 1 }
                )
              ];
            }
          }),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_DEAL_COMBAT_DAMAGE,
            frequencyPerGameTurn: 1,
            filter(event) {
              return card.isExhausted && isAlliedAstralBall(event.data.card);
            },
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

export const cosmicAvatarAlt: MinionBlueprint = {
  ...cosmicAvatar,
  id: 'cosmicAvatarAlt',
  collectable: false,
  art: defaultCardArt('minions/cosmic-avatar-alt')
};
