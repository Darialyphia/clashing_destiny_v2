import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  JOBS,
  MINION_TYPES,
  RARITIES
} from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { ProtectorModifier } from '../../../../../modifier/modifiers/protector.modifier';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';
import { predict } from '../../../../card-actions-utils';

export const littleWitch: MinionBlueprint = {
  id: 'little_witch',
  name: 'Little Witch',
  description: dedent /*html*/ `
    <rt-keyword>Protector</rt-keyword>
    <br/>
    <rt-trigger>On Destroyed</rt-trigger> Draw a card. <rt-lvl-bonus lvl="2"><rt-keyword>Predict</rt-keyword> then draw a card instead.</rt-lvl-bonus> 
    `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.ACOLYTE],
  affinity: AFFINITIES.NEUTRAL,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  subKind: MINION_TYPES.MELEE,
  tags: [],
  atk: 1,
  maxHp: 2,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(new ProtectorModifier(game, card));
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async () => {
          if (lvlMod.isActive) {
            await predict(game, card);
          }
          await card.player.cardManager.draw(1);
        }
      })
    );
  },
  async onPlay(game, card) {},
  aiHints: {
    shouldPlay: () => 0,
    shouldMove: () => 0,
    shouldAttack: () => 0,
    getThreatScore: () => 0
  }
};
