import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import type { DestinyBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { DestinyCard } from '../../../entities/destiny.entity';

export const arcaneMastery: DestinyBlueprint = {
  id: 'arcane-mastery',
  name: 'Arcane Mastery',
  cardIconId: 'talent-arcane-mastery',
  description:
    'Give your Hero +1 @[spellpower]@.\n@[level] 5+ bonus@: give +1@[spellpower]@ more.',
  collectable: true,
  unique: false,
  destinyCost: 1,
  affinity: AFFINITIES.ARCANE,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 1,
  countsAsLevel: true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 5));
  },
  async onPlay(game, card) {
    const levelMod = card.modifiers.get(
      LevelBonusModifier
    )! as LevelBonusModifier<DestinyCard>;

    await card.player.hero.modifiers.add(
      new Modifier('arcane-mastery', game, card, {
        icon: 'keyword-spellpower-buff',
        name: 'Arcane Mastery',
        description: `+1 Spellpower. Level 5+ bonus: +2 Spellpower.`,
        mixins: [
          new HeroInterceptorModifierMixin(game, {
            key: 'spellPower',
            interceptor: value => {
              return value + (levelMod.isActive ? 2 : 1);
            }
          })
        ]
      })
    );
  }
};
