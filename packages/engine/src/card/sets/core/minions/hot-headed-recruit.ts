import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { DoubleAttackModifier } from '../../../../modifier/modifiers/double-attack.modifier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const hotHeadedRecruit: MinionBlueprint = {
  id: 'hot-headed-recruit',
  name: 'Hot-Headed Recruit',
  cardIconId: 'unit-hot-blooded-recruit',
  description: `@Rush@. @[level] 4+@ : @Double Attack@.`,
  collectable: true,
  unique: false,
  manaCost: 1,
  atk: 1,
  maxHp: 1,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new RushModifier(game, card));
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 4)
    )) as LevelBonusModifier<MinionCard>;
    await card.modifiers.add(
      new DoubleAttackModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );
  },
  async onPlay() {}
};
