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
import { RUNES } from '../../../../../player/player.enums';

export const fireBall: SpellBlueprint<MinionCard> = {
  id: 'fireBall',
  name: 'Fire Ball',
  description: dedent /*html*/ `
  Consume <rt-runes runes="wisdom"></rt-runes>
  Deal 4 damage to an enemy minion.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/fireball'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    card.player.runeManager.has({ wisdom: 1 }) &&
    singleEnemyMinionTargetRules.canPlay(game, card),
  getTargets: (game, card) =>
    singleEnemyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleEnemyTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    if (!card.player.runeManager.has({ wisdom: 1 })) {
      return;
    }

    await card.player.runeManager.remove([RUNES.WISDOM]);

    await target.takeDamage(card, new SpellDamage(4, card));
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
