import dedent from 'dedent';
import { VigilantModifier } from '../../../../../modifier/modifiers/vigilant.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import type { MinionCard } from '../../../../entities/minion.entity';
import { SimpleHealthBuffModifier } from '../../../../../modifier/modifiers/simple-health-buff.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const wanderingPaladin: MinionBlueprint = {
  id: 'wandering-paladin',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Wandering Paladin',
  description: dedent`
  @Vigilant@.
  @[lvl] 3 Bonus@: +2 Health.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 3)
    )) as LevelBonusModifier<MinionCard>;
    await card.modifiers.add(new VigilantModifier(game, card));

    await card.modifiers.add(
      new SimpleHealthBuffModifier('wandering-paladin-hp-buff', game, card, {
        amount: 2,
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );
  },
  async onPlay() {}
};
