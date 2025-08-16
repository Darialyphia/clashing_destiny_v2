import { ArtifactInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleArtifactTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import { ArtifactCard } from '../../../entities/artifact.entity';

export const forgedInTheCrater: SpellBlueprint = {
  id: 'forged-in-the-crater',
  name: 'Forged in the Crater',
  cardIconId: 'spell-forged-in-the-crater',
  description:
    'Give a weapon equiped to your Hero +2 @[attack]@. @[level] 3+@ : draw a card in your Destiny zone',
  collectable: true,
  unique: false,
  manaCost: 2,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: (game, card) =>
    singleArtifactTargetRules.canPlay(
      game,
      card,
      artifact => artifact.subkind === ARTIFACT_KINDS.WEAPON
    ),
  getPreResponseTargets: async (game, card) => {
    return singleArtifactTargetRules.getPreResponseTargets(
      game,
      card,
      { type: 'card', card },
      artifact => artifact.subkind === ARTIFACT_KINDS.WEAPON
    );
  },
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
  },
  async onPlay(game, card, targets) {
    const target = targets[0] as ArtifactCard;
    await target.modifiers.add(
      new Modifier('forged-in-the-crater-buff', game, card, {
        mixins: [
          new ArtifactInterceptorModifierMixin(game, {
            key: 'attackBonus',
            interceptor(value) {
              return value + 2;
            }
          })
        ]
      })
    );
  }
};
