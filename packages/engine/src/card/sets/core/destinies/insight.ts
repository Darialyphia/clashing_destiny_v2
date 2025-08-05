import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { DestinyBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const insight: DestinyBlueprint = {
  id: 'insight',
  name: 'Insight',
  cardIconId: 'talent-insight',
  description: 'Draw a card. You cannot declare attacks this turn.',
  collectable: true,
  unique: false,
  destinyCost: 0,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 0,
  countsAsLevel: true,
  abilities: [],
  async onInit() {},
  async onPlay(game, card) {
    await card.player.cardManager.draw(1);
    const targets = [card.player.hero, ...card.player.boardSide.getAllMinions()];
    for (const target of targets) {
      await target.modifiers.add(
        // @ts-expect-error
        new Modifier('insight-cannot-attack', game, card, {
          mixins: [
            new UnitInterceptorModifierMixin(game, {
              key: 'canAttack',
              interceptor: () => false
            }),
            new UntilEndOfTurnModifierMixin(game)
          ]
        })
      );
    }
  }
};
