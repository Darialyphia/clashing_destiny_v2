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
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { ShieldModifier } from '../../../../modifier/modifiers/shield.modifier';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { MinionCard } from '../../../entities/minion.entity';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';

export const saphireSeer: MinionBlueprint = {
  id: 'sapphire-seer',
  name: 'Sapphire Seer',
  description: dedent /*html*/ `
  <rt-keyword>Shield</rt-keyword><br/>
  <rt-location locations="battlefield"></rt-location> Enemies here have -1/+0/+0.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/sapphire-seer'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.NEUTRAL, AFFINITIES.NEUTRAL],
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 4,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new ShieldModifier(game, card));
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<MinionCard>('sapphire-seer', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return (
                isMinion(candidate) &&
                candidate.isEnemy(card) &&
                candidate.location === card.location
              );
            },
            getModifiers() {
              return [
                new SimpleStatsBuffModifier('sapphire-seer-cmd-debuff', game, card, {
                  cmd: -1,
                  atk: 0,
                  hp: 0
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
