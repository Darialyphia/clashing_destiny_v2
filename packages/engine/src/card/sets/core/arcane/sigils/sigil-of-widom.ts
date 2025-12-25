import type { SigilBlueprint } from '../../../../card-blueprint';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import type { SigilCard } from '../../../../entities/sigil.entity';

export const sigilOfWisdom: SigilBlueprint = {
  id: 'sigil-of-wisdom',
  kind: CARD_KINDS.SIGIL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Sigil of Wisdom',
  description:
    '@On Destroyed@: Draw 2 cards into your Destiny Zone. @[lvl] 3 Bonus@: Draw them into your hand instead.',
  faction: FACTIONS.ARCANE,
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
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 3,
  abilities: [],
  maxCountdown: 2,
  speed: CARD_SPEED.SLOW,
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 3)
    )) as LevelBonusModifier<SigilCard>;

    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async () => {
          if (levelMod.isActive) {
            await card.player.cardManager.draw(2);
          } else {
            await card.player.cardManager.drawIntoDestinyZone(2);
          }
        }
      })
    );
  },
  async onPlay() {}
};


