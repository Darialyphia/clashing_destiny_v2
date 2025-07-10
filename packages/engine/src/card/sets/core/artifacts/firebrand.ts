import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { isMinion } from '../../../card-utils';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { ArtifactCard } from '../../../entities/artifact.entity';

export const firebrand: ArtifactBlueprint = {
  id: 'firebrand',
  name: 'Firebrand',
  cardIconId: 'artifact-firebrand',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 2,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.FIRE,
  durability: 2,
  subKind: ARTIFACT_KINDS.WEAPON,
  abilities: [
    {
      id: 'firebrand-ability',
      label: 'Use ability',
      description: `@[exhaust]@ -1@[durability]@  : This turn, your hero gain +1@[attack]@ and has @On Attack@: Inflicts @Burn@ to the target.`,
      manaCost: 0,
      shouldExhaust: true,
      canUse(game, card) {
        return card.location === 'board';
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        console.log('todo: implement firebrand ability');
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
