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

export const tomeOfKnowledge: ArtifactBlueprint = {
  id: 'tome-of-knowledge',
  name: 'Tome of Knowledge',
  cardIconId: 'artifact-book-of-knowledge',
  description: 'This comes into play exhausted.',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.NORMAL,
  durability: 2,
  subKind: ARTIFACT_KINDS.RELIC,
  abilities: [
    {
      id: 'tome-of-knowledge-ability',
      label: '@[exhaust]@ +1 Spellpower',
      description: `@[exhaust]@ -1@[durability]@ : Your hero gains +1 @[spellpower]@.`,
      manaCost: 2,
      shouldExhaust: true,
      canUse(game, card) {
        return card.location === 'board';
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.player.hero.modifiers.add(
          new Modifier<HeroCard>('tome-of-knowledge-buff', game, card, {
            name: 'Tome of Knowledge',
            description: `+1 Spellpower.`,
            icon: 'keyword-abilitypower-buff',
            mixins: [
              new HeroInterceptorModifierMixin(game, {
                key: 'spellPower',
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
  async onPlay(ame, card) {
    await card.exhaust();
  }
};
