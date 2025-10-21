import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const chainmail: ArtifactBlueprint = {
  id: 'chainmail',
  name: 'Chainmail',
  cardIconId: 'artifacts/chainmail',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  job: null,
  spellSchool: null,
  durability: 1,
  subKind: ARTIFACT_KINDS.ARMOR,
  abilities: [
    {
      id: 'chainmail-ability',
      label: '@[exhaust]@ : Grant hero Shield',
      description: `-1@[durability]@ @[exhaust]@ : Negate the next 2 damage your Hero takes.`,
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
        card.player.hero.gainShield(2);
        await card.loseDurability(1);
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
