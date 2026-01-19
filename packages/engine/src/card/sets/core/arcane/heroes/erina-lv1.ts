import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { discover, getEmpowerStacks } from '../../../../card-actions-utils';
import type { HeroBlueprint } from '../../../../card-blueprint';
import { isSpell } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';

export const erinaLv1: HeroBlueprint = {
  id: 'erina-council-mage',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Erina, Council Mage',
  description: '@On Enter@: If you are @Empowered@, @Discover@ a spell from your deck.',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.RARE,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: false,
        oil: false,
        gradient: false,
        lightGradient: true,
        scanlines: false,
        goldenGlare: false,
        glitter: true
      },
      dimensions: {
        width: 174,
        height: 140
      },
      bg: 'heroes/erina-lv1-bg',
      main: 'heroes/erina-lv1',
      breakout: 'heroes/erina-lv1-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 2,
  level: 1,
  lineage: 'erina',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 15,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const empowerStacks = getEmpowerStacks(card);
          if (!empowerStacks) return;
          const spellCardsInDeck = card.player.cardManager.mainDeck.cards.filter(isSpell);
          if (spellCardsInDeck.length === 0) return;

          await discover(game, card, spellCardsInDeck);
        }
      })
    );
  },
  async onPlay() {}
};
