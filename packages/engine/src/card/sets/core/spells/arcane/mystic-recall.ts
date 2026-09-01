import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleMinionTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { Modifier } from '../../../../../modifier/modifier.entity';
import type { SpellCard } from '../../../../entities/spell.entity';
import { SpellInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';

export const mysticRecall: SpellBlueprint<MinionCard> = {
  id: 'mysticRecall',
  name: 'Mystic Recall',
  description: dedent /*html*/ `
    Return an ally minion to its owner's hand. Draw a card.
    <rt-runes runes="wisdom,focus"></rt-runes> This is fast speed.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder-spell'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card, minion => minion.isAlly(card)),
  getTargets: (game, card) =>
    singleMinionTargetRules.getTargets({
      game,
      card,
      predicate: minion => minion.isAlly(card),
      aiHints: {
        shouldPick: () => 1
      },
      timeoutFallback: singleMinionTargetRules.defaultTimeoutFallback(game, card)
    }),
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<SpellCard>('mysticRecall', game, card, {
        mixins: [
          new SpellInterceptorModifierMixin(game, {
            key: 'speed',
            interceptor() {
              return CARD_SPEED.FAST;
            }
          })
        ]
      })
    );
  },
  async onPlay(game, card, targets) {
    const minion = targets.cards[0];
    if (minion.isOnBoard) {
      await minion.addToHand();
    }

    await card.player.cardManager.draw(1);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
