import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';

export const runedShiv: ArtifactBlueprint = {
  id: 'runed-shiv',
  name: 'Runed Shiv',
  cardIconId: 'artifact-runed-shiv',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 1,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.NORMAL,
  durability: 2,
  subKind: ARTIFACT_KINDS.WEAPON,
  abilities: [
    {
      id: 'runed-shiv-ability',
      label: '+2 Attack',
      description: `@[exhaust]@ -1@[durability]@  : This turn, your hero gain +1@[attack]@.`,
      manaCost: 0,
      shouldExhaust: true,
      canUse(game, card) {
        return card.location === 'board';
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.player.hero.modifiers.add(
          new Modifier<HeroCard>('runed-shiv-buff', game, card, {
            name: 'Runed Shiv',
            description: `+1 Attack.`,
            icon: 'keyword-attack-buff',
            mixins: [
              new UntilEndOfTurnModifierMixin<HeroCard>(game),
              new HeroInterceptorModifierMixin(game, {
                key: 'atk',
                interceptor(value) {
                  return value + 1;
                }
              })
            ]
          })
        );
        await card.loseDurability(1);
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
