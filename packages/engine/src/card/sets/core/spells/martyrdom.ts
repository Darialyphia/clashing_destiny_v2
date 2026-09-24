import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleAllyMinionTargetRules } from '../../../card-utils';
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
  Destroy an ally minion at a battlefield. You gain influence here equal to the minion's attack.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/martyrdom'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.LIGHT],
  manaCost: 2,
  manaSupply: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    singleAllyMinionTargetRules.canPlay(game, card, m => m.isOnBattlefield),
  getTargets: (game, card) =>
    singleAllyMinionTargetRules.getTargets({
      game,
      card,
      predicate: m => m.isOnBattlefield,
      timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(
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
