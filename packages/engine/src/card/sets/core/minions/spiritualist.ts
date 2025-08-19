import { MinionInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const spiritualist: MinionBlueprint = {
  id: 'spiritualist',
  name: 'Spiritualist',
  cardIconId: 'unit-spiritualist',
  description: `If you played a spell this turn, this costs @[mana] 2@ less.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 3,
  maxHp: 3,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier('spiritualist-cost-reduction', game, card, {
        mixins: [
          new MinionInterceptorModifierMixin(game, {
            key: 'manaCost',
            interceptor(value) {
              const hasPlayedSpellThisTurn = card.player.cardTracker
                .getCardsPlayedThisGameTurnOfKind(CARD_KINDS.SPELL)
                .filter(c => c.player.equals(game.gamePhaseSystem.currentPlayer));

              return hasPlayedSpellThisTurn.length > 0
                ? Math.max(0, (value ?? 0) - 2)
                : value;
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
