import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { TidesFavoredModifier } from '../../../../modifier/modifiers/tide-modifier';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const orbOfTheTides: ArtifactBlueprint = {
  id: 'orb-of-the-tides',
  name: 'Orb of the Tides',
  cardIconId: 'artifact-orb-of-tides',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 2,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.NORMAL,
  durability: 1,
  subKind: ARTIFACT_KINDS.RELIC,
  abilities: [
    {
      id: 'orb-of-the-tides-ability',
      label: '@[exhaust]@ : Increase Tide',
      description: `@[exhaust]@ -1@[durability]@ : Set your @Tide@ to 3.`,
      manaCost: 0,
      shouldExhaust: true,
      canUse(game, card) {
        return card.location === 'board';
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.player.hero.modifiers.get(TidesFavoredModifier)?.setStacks(3);
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
