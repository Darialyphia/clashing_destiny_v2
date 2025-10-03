import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';

export const scalesOfDestiny: ArtifactBlueprint = {
  id: 'scales-of-destiny',
  name: 'Scales of Destiny',
  cardIconId: 'artifacts/scales-of-destiny',
  description: ``,
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.ARTIFACT,
  job: HERO_JOBS.WARRIOR,
  spellSchool: null,
  durability: 2,
  subKind: ARTIFACT_KINDS.WEAPON,
  atkBonus: 1,
  abilities: [
    {
      id: 'scales-of-destiny-ability',
      label: '@[exhaust]@ : Draw 1 in Destiny',
      description: `-1@[durability]@ @[exhaust]@ : Draw a card into your Destiny Zone. You can use this ability only if you have the same amount of cards in your hand and Destiny Zone.`,
      manaCost: 0,
      shouldExhaust: true,
      speed: CARD_SPEED.SLOW,
      canUse(game, card) {
        return (
          card.location === 'board' &&
          card.player.cardManager.hand.length === card.player.cardManager.destinyZone.size
        );
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.player.cardManager.drawIntoDestinyZone(1);
        await card.loseDurability(1);
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
