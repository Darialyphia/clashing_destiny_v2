import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { HeroBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { isMinion } from '../../../../card-utils';
import { HeroCard } from '../../../../entities/hero.entity';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';

export const haroldLv3: HeroBlueprint = {
  id: 'harold-scended-seraph',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Harold, Ascended Seraph',
  description: 'TODO',
  faction: FACTIONS.ORDER,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  art: {
    default: {
      foil: {
        lightGradient: true,
        goldenGlare: true
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'heroes/harold-lv3-bg',
      main: 'heroes/harold-lv3',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  destinyCost: 4,
  level: 3,
  lineage: 'harold',
  atk: 0,
  maxHp: 18,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {},
  async onPlay() {}
};
