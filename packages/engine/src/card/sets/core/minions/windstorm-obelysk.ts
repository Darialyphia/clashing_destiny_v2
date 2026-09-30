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
import { SpawnModifier } from '../../../../modifier/modifiers/spawn.modifier';
import { windDervish } from './wind-dervish';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import type { MinionCard } from '../../../entities/minion.entity';
import { InstantMoveModifier } from '../../../../modifier/modifiers/instant-move.modifier';
import { StructureModifier } from '../../../../modifier/modifiers/structure.modifier';

export const windstormObelysk: MinionBlueprint = {
  id: 'windstorm-obelysk',
  name: 'Windstorm Obelysk',
  description: dedent /*html*/ `
  <rt-keyword>Structure</rt-keyword>.
  <rt-keyword>Spawn</rt-keyword>: <rt-card>Wind Dervish</rt-card>.
  Your <rt-card>Wind Dervish</rt-card> have <rt-keyword>Instant Move</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/windstorm-obelysk'),
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
    await card.modifiers.add(new StructureModifier(game, card));
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
              return [new InstantMoveModifier(game, card)];
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
