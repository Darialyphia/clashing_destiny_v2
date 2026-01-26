import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS,
  ARTIFACT_KINDS,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { isMinion } from '../../../../card-utils';

export const amuletOfRemembrance: ArtifactBlueprint = {
  id: 'amulet-of-remembrance',
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Amulet of Remembrance',
  description: dedent``,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  subKind: ARTIFACT_KINDS.RELIC,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
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
      tint: FACTIONS.NEUTRAL.defaultCardTint
    }
  },
  destinyCost: 0,
  durability: 1,
  speed: CARD_SPEED.SLOW,
  abilities: [
    {
      id: 'amulet-of-remembrance-ability',
      description:
        'Draw a card. You can activate this card only if an allied minion has died this turn.',
      label: 'Draw Card',
      canUse: (game, card) =>
        card.location === CARD_LOCATIONS.BOARD &&
        card.player.cardTracker.cardsDestroyedThisGameTurn.some(
          c => c.card.isAlly(card) && isMinion(c.card)
        ),
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 1,
      durabilityCost: 1,
      shouldExhaust: true,
      speed: CARD_SPEED.BURST,
      async onResolve(game, card) {
        await card.player.cardManager.draw(1);
      }
    }
  ],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
