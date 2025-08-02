import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { scry } from '../../../card-actions-utils';
import type {
  Ability,
  DestinyBlueprint,
  PreResponseTarget
} from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';

export const manaVisions: DestinyBlueprint = {
  id: 'mana-visions',
  name: 'Mana Visions',
  cardIconId: 'talent-mana-visions',
  description: '',
  collectable: true,
  unique: false,
  destinyCost: 1,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 1,
  abilities: [
    {
      id: 'mana-visions-ability',
      manaCost: 1,
      shouldExhaust: true,
      description: '@[exhaust]@ @[mana] 1@ : @Scry 1@.',
      label: '@[exhaust]@ : @Scry 1@',
      getPreResponseTargets: async () => [],
      canUse: () => true,
      onResolve: async (game, card) => {
        await scry(game, card, 1);
      }
    }
  ],
  async onInit() {},
  async onPlay() {}
};
