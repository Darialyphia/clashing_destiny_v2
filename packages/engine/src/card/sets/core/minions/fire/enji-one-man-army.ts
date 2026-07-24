import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED,
  JOBS
} from '../../../../card.enums';
import { UniqueModifier } from '../../../../../modifier/modifiers/unique.modifier';
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';
import { RUNES } from '../../../../../player/player.enums';
import { OverwhelmModifier } from '../../../../../modifier/modifiers/overwhelm.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { AttackerModifier } from '../../../../../modifier/modifiers/attacker.modifier';
import { ToughModifier } from '../../../../../modifier/modifiers/tough.modifier';

export const enjiOneManArmy: MinionBlueprint = {
  id: 'enjiOneManArmy',
  name: 'Enji, One-Man Army',
  description: dedent /*html*/ `
  <rt-keyword>Unique</rt-keyword> <rt-keyword>Rush 1</rt-keyword>
  If This is the only minion you control on a battlefield, this has <rt-keyword>Attacker 3</rt-keyword>, <rt-keyword>Tough 1</rt-keyword> and <rt-keyword>Overwhelm</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/enji-one-man-army'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.FIRE],
  manaCost: 6,
  runeCost: [RUNES.MIGHT, RUNES.FOCUS],
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 5,
  commandment: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new UniqueModifier(game, card));
    await card.modifiers.add(new RushModifier(game, card, { cost: 1 }));
    const isAlone = () => {
      const battlefield = card.battlefield;
      if (!battlefield) return false;
      const friendlyMinions = battlefield.spaces
        .map(space => space.card)
        .filter(c => c && c.isAlly(card.player) && !c.equals(card));
      return friendlyMinions.length === 0;
    };
    await card.modifiers.add(
      new AttackerModifier(game, card, {
        amount: 3,
        mixins: [new TogglableModifierMixin(game, isAlone)]
      })
    );
    await card.modifiers.add(
      new OverwhelmModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, isAlone)]
      })
    );
    await card.modifiers.add(
      new ToughModifier(game, card, {
        amount: 1,
        mixins: [new TogglableModifierMixin(game, isAlone)]
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

export const enjiOneManArmyAlt: MinionBlueprint = {
  ...enjiOneManArmy,
  id: 'enjiOneManArmyAlt',
  collectable: false,
  art: defaultCardArt('minions/enji-one-man-alt')
};
export const enjiOneManArmyFullArt: MinionBlueprint = {
  ...enjiOneManArmy,
  id: 'enjiOneManArmyFullArt',
  collectable: false,
  art: defaultCardArt('minions/enji-one-man-army-fullart', true)
};
