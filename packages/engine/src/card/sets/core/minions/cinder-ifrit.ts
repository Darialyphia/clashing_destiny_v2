import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../card.enums';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { AbilityDamage } from '../../../../utils/damage';
import { FACTION_IDS } from '../../../factions/factions';

export const cinderIfrit: MinionBlueprint = {
  id: 'cinder-ifrit',
  name: 'Cinder Ifrit',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger>: Enemy minions take damage equal to their <rt-keyword>Burn</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  manaCost: 4,
  manaSupply: 2,
  level: 3,
  exp: 1,
  factionId: FACTION_IDS.VETRUVIAN,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 4,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const burningEnemies = card.player.enemyMinions
            .map(enemy => ({ enemy, burn: enemy.modifiers.get(BurnModifier) }))
            .filter(({ burn }) => !!burn && burn.stacks > 0);

          for (const { enemy, burn } of burningEnemies) {
            await enemy.takeDamage(card, new AbilityDamage(burn!.stacks));
          }
        }
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
