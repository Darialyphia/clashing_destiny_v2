import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt, isMinion } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SpellDamage } from '../../../../utils/damage';

export const ghostLightning: SpellBlueprint = {
  id: 'ghostLightning',
  name: 'Ghost Lightning',
  description: dedent /*html*/ `
  Deal 1 damage to all enemy minions at a battlefield.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/ghost-lightning'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    const targets = game.boardSystem
      .getAllCardsInPlay()
      .filter(c => isMinion(c) && c.isEnemy(card) && c.isOnBattlefield) as MinionCard[];

    for (const target of targets) {
      await target.takeDamage(card, new SpellDamage(1, card));
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
