import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleEnemyTargetRules } from '../../../../card-utils';
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
import type { HeroCard } from '../../../../entities/hero.entity';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const fireBall: SpellBlueprint<MinionCard | HeroCard> = {
  id: 'fireBall',
  name: 'Fire Ball',
  description: dedent /*html*/ `
  Deal 4 damage to an enemy and adjacent minions.
  <rt-lvl-bonus lvl="3">This costs 1 less.</rt-lvl-bonus>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 4,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: () => true,
  getTargets: (game, card) =>
    singleEnemyTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleEnemyTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleManacostModifier('fireball-discount', game, card, {
        amount: -1,
        mixins: []
      })
    );
  },
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(4, card));

    const adjacentMinions = target.position.getAdjacentCardsOfKind<MinionCard>(
      CARD_KINDS.MINION
    );
    for (const adjacent of adjacentMinions) {
      await adjacent.takeDamage(card, new SpellDamage(4, card));
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
