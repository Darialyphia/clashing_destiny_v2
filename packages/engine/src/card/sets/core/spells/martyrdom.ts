import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleEnemyMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const martyrdom: SpellBlueprint<MinionCard> = {
  id: 'martyrdom',
  name: 'Martyrdom',
  description: dedent /*html*/ `
  Destroy an enemy minion at a battlefield. Your opponent gains influence here equal to the minion's attack.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/martyrdom'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT],
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    singleEnemyMinionTargetRules.canPlay(game, card, m => m.isOnBattlefield),
  getTargets: (game, card) =>
    singleEnemyMinionTargetRules.getTargets({
      game,
      card,
      predicate: m => m.isOnBattlefield,
      timeoutFallback: singleEnemyMinionTargetRules.defaultTimeoutFallback(
        game,
        card,
        m => m.isOnBattlefield
      ),
      canCancel: true,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    const attack = target.atk;
    const battlefield = target.battlefield;
    await target.destroy(card);
    if (battlefield) {
      await battlefield.gainScore(attack);
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
