import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { EphemeralModifier } from '../../../../modifier/modifiers/ephemeral.modifier';
import { SpawnModifier } from '../../../../modifier/modifiers/spawn.modifier';
import { windDervish } from './wind-dervish';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import type { MinionCard } from '../../../entities/minion.entity';
import { OnAttackModifier } from '../../../../modifier/modifiers/on-attack.modifier';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';

export const fireblazeObelysk: MinionBlueprint = {
  id: 'fireblaze-obelysk',
  name: 'Fireblaze Obelysk',
  description: dedent /*html*/ `
  <rt-keyword>Structure</rt-keyword>.
  <rt-keyword>Spawn</rt-keyword>: <rt-card>Wind Dervish</rt-card>.
  Your <rt-card>Wind Dervish</rt-card> have <rt-trigger>On Attack</rt-trigger>: Infict <rt-keyword>Burn 1</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/fireblaze-obelysk'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 0,
  maxHp: 2,
  affinities: [AFFINITIES.AIR, AFFINITIES.AIR],
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new EphemeralModifier(game, card));
    await card.modifiers.add(
      new SpawnModifier(game, card, {
        blueprint: () => windDervish
      })
    );
    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>('fireblaze-obelysk-aura', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return (
                candidate.isAlly(card) &&
                isMinion(candidate) &&
                candidate.isOnBoard &&
                candidate.blueprintId === windDervish.id
              );
            },
            getModifiers() {
              return [
                new OnAttackModifier(game, card, {
                  async handler(event) {
                    await event.data.target.modifiers.add(
                      new BurnModifier(game, card, { stacks: 1 })
                    );
                  }
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
