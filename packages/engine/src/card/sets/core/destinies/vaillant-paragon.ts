import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { scry } from '../../../card-actions-utils';
import type { DestinyBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const vaillantParagon: DestinyBlueprint = {
  id: 'vaillant-paragon',
  name: 'Vaillant Paragon',
  cardIconId: 'talent-shieldmaster',
  description: 'Your Hero can block.',
  collectable: true,
  unique: false,
  destinyCost: 2,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  tags: [],
  minLevel: 1,
  countsAsLevel: true,
  abilities: [],
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new Modifier('vaillant-paragon', game, card, {
        mixins: [
          new HeroInterceptorModifierMixin(game, {
            key: 'canBlock',
            interceptor() {
              return true;
            }
          })
        ]
      })
    );
  }
};
