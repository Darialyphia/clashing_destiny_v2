import dedent from 'dedent';
import type { SpellBlueprint, Targets } from '../../../../card-blueprint';
import {
  defaultCardArt,
  isMinion,
  multipleEnemyTargetRules
} from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  JOBS,
  RARITIES
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { SpellDamage } from '../../../../../utils/damage';
import type { InteractionResult } from '../../../../../game/systems/game-interaction.system';

export const twinFlame: SpellBlueprint<MinionCard> = {
  id: 'twinFlame',
  name: 'Twin Flame',
  description: dedent /*html*/ `
  Deal 2 damage to 2 enemy minions on a battlefield.
  <rt-runes runes="wisdom,wisdom,resonance"></rt-runes> Deal 3 damage instead.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 5,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    multipleEnemyTargetRules.canPlay(
      game,
      card,
      2,
      card => isMinion(card) && card.isOnBattlefield
    ),
  getTargets: (game, card) =>
    multipleEnemyTargetRules.getTargets(game, card, {
      min: 2,
      max: 2,
      predicate: card => isMinion(card) && card.isOnBattlefield,
      timeoutFallback: [],
      aiHints: {
        shouldPick: () => 1
      },
      label: 'Select 2 enemy minions to deal damage to',
      allowRepeat: false
    }) as Promise<InteractionResult<Targets<MinionCard>>>,
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    const damageAmount = card.player.runeManager.has({ wisdom: 2, resonance: 1 }) ? 3 : 2;

    for (const target of targets.cards) {
      await target.takeDamage(card, new SpellDamage(damageAmount, card));
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
