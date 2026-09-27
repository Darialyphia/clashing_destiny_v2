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
import { ChannelModifier } from '../../../../modifier/modifiers/channel.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';

export const aymaraHealer: MinionBlueprint = {
  id: 'aymara-healer',
  name: 'Aymara Healer',
  description: dedent /*html*/ `
 <rt-location locations="battlefield"></rt-location> <rt-keyword>Channel</rt-keyword>: Every enemy minion here gets -1/-1/-1. Heal allies here for 1 for each affected enemy minion.    
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/aymara-healer'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  manaCost: 4,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 6,
  affinities: [AFFINITIES.AIR, AFFINITIES.AIR, AFFINITIES.NEUTRAL],
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new ChannelModifier('aymara-healer-channel', game, card, {
        async handler() {
          const enemies = card.player.enemyMinions.filter(
            minion => minion.location === card.location
          );
          for (const enemy of enemies) {
            await enemy.modifiers.add(
              new SimpleStatsBuffModifier('aymara-healer-debuff', game, card, {
                atk: -1,
                cmd: -1,
                hp: -1
              })
            );
          }
          const allies = card.player.minions.filter(
            minion => minion.location === card.location
          );
          const healAmount = enemies.length;
          for (const ally of allies) {
            await ally.heal(healAmount);
          }
        },
        mixins: [new TogglableModifierMixin(game, () => card.isOnBattlefield)]
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
