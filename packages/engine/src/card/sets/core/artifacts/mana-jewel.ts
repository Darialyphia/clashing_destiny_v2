import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const manaJewel: ArtifactBlueprint = {
  id: 'mana-jewel',
  name: 'Mana Jewel',
  cardIconId: 'artifacts/mana-jewel',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.ARTIFACT,
  job: null,
  spellSchool: null,
  durability: 1,
  subKind: ARTIFACT_KINDS.RELIC,
  abilities: [
    {
      id: 'mana-jewel-ability',
      label: '@[exhaust]@ : Gain 2 Mana Sparks',
      description: `-1@[durability]@ @[exhaust]@ : Add 2 @Mana Spark@ to your hand.`,
      manaCost: 0,
      shouldExhaust: true,
      speed: CARD_SPEED.FLASH,
      canUse(game, card) {
        return card.location === 'board';
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        const sparks = [
          await card.player.generateCard('mana-spark'),
          await card.player.generateCard('mana-spark')
        ];

        for (const spark of sparks) {
          await spark.addToHand();
        }
        await card.loseDurability(1);
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
