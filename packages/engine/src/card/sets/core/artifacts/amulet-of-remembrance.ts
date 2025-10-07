import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const amuletOfRemembrance: ArtifactBlueprint = {
  id: 'amulet-of-remembrance',
  name: 'Amulet of Remembrance',
  cardIconId: 'artifacts/amulet-of-remembrance',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  destinyCost: 0,
  speed: CARD_SPEED.SLOW,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.ARTIFACT,
  job: null,
  spellSchool: null,
  durability: 1,
  subKind: ARTIFACT_KINDS.RELIC,
  abilities: [
    {
      id: 'amulet-of-remembrance-ability',
      label: '@[exhaust]@ : Draw a card',
      description: `-1@[durability]@ @[exhaust]@ : Draw a card. You can only activate this ability if an ally minion died this turn.`,
      manaCost: 0,
      shouldExhaust: true,
      speed: CARD_SPEED.FLASH,
      canUse(game, card) {
        return (
          card.location === 'board' &&
          card.player.cardTracker.minionsDestroyedThisGameTurn.length > 0
        );
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.player.cardManager.draw(1);
        await card.loseDurability(1);
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
