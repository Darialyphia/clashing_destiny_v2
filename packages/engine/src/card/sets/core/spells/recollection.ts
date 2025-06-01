import { MainDeckCardInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.card';

export const recollection: SpellBlueprint<MinionCard | HeroCard> = {
  id: 'recollection',
  name: 'Recollection',
  cardIconId: 'recollection',
  description:
    'Add a copy of all cards you played since the start of the current game turn. They cost 1 more.',
  collectable: true,
  unique: false,
  manaCost: 2,
  affinity: AFFINITIES.CHRONO,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  subKind: SPELL_KINDS.BURST,
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit() {},
  async onPlay(game, card) {
    for (const playedCard of card.player.cardTracker.cardsPlayedSinceStartOfLastOwnTurn) {
      const copy = await card.player.generateCard(playedCard.blueprintId);

      await copy.modifiers.add(
        new Modifier('recollection-debuff', game, card, {
          mixins: [
            new MainDeckCardInterceptorModifierMixin(game, {
              key: 'manaCost',
              interceptor: value => value! + 1
            })
          ]
        })
      );

      await copy.addToHand();
    }
  }
};
