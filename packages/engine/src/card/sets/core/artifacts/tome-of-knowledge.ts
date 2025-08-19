import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const tomeOfKnowledge: ArtifactBlueprint = {
  id: 'tome-of-knowledge',
  name: 'Tome of Knowledge',
  cardIconId: 'artifact-book-of-knowledge',
  description: '',
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
      description: `@[exhaust]@ @[mana] 1@ -1@[durability]@ : Your hero gains +1 @[spellpower]@ this turn.`,
      manaCost: 1,
      shouldExhaust: true,
      canUse(game, card) {
        return card.location === 'board';
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.player.hero.modifiers.add(
          new SimpleSpellpowerBuffModifier('tome-of-knowledge-buff', game, card, {
            amount: 1,
            mixins: [new UntilEndOfTurnModifierMixin(game)]
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
