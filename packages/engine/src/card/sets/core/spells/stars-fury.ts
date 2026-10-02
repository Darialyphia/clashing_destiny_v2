import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { EphemeralModifier } from '../../../../modifier/modifiers/ephemeral.modifier';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';
import { isDefined } from '@game/shared';
import { windDervish } from '../minions/wind-dervish';
import type { MinionCard } from '../../../entities/minion.entity';

export const starsFury: SpellBlueprint = {
  id: 'stars-fury',
  name: "Star's Fury",
  description: dedent /*html*/ `
  Summon a <rt-card>Wind Dervish</rt-card> in front of each enemy minion at a battlefield.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/stars-fury'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.LEGENDARY,
  affinities: [AFFINITIES.AIR, AFFINITIES.AIR, AFFINITIES.AIR],
  manaCost: 5,
  manaSupply: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: () => true,
  getTargets: (game, card) =>
    anywhereTargetRules.getTargets({ game, card, canCancel: true }),
  async onInit() {},
  async onPlay(game, card) {
    const enemies = card.player.enemyMinions.filter(m => m.isOnBattlefield);

    const spaces = enemies
      .map(enemy => enemy.position?.inFront)
      .filter(isDefined)
      .filter(space => space.isEmpty);

    for (const space of spaces) {
      const dervish = await card.player.generateCard<MinionCard>(
        windDervish.id,
        card.isFoil
      );
      await dervish.playImmediatelyAt(space, { shouldExhaust: false });
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
