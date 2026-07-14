import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  singleEnemyMinionTargetRules,
  singleEnemyTargetRules
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

export const fireBolt: SpellBlueprint<MinionCard> = {
  id: 'fireBolt',
  name: 'Fire Bolt',
  description: dedent /*html*/ `
  Deal 1 damage to an enemy minion at a battlefield.
  <rt-job-bonus job="${JOBS.MAGE.id}"><rt-runes runes="wisdom,wisdom"></rt-runes> This can also target enemy minions in base.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    singleEnemyMinionTargetRules.canPlay(game, card, minion =>
      card.player.runeManager.has({ wisdom: 2 }) ? true : minion.isOnBattlefield
    ),
  getTargets: (game, card) =>
    singleEnemyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleEnemyTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      predicate: minion =>
        card.player.runeManager.has({ wisdom: 2 }) ? true : minion.isOnBattlefield,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(1, card));
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
