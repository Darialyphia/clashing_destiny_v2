import type { HeroBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const noviceLv0: HeroBlueprint = {
  id: 'novice-lv0',
  name: 'Novice',
  description: '',
  collectable: false,
  level: 0,
  cardIconId: 'heroes/novice-lv0.png',
  destinyCost: 0,
  speed: CARD_SPEED.SLOW,
  canPlay: () => true,
  kind: CARD_KINDS.HERO,
  jobs: [],
  spellSchools: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 5,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      id: 'novice-ability-1',
      label: '@[exhaust]@ : Draw into Destiny',
      description: '@[exhaust]@ : Draw a card into your Destiny zone.',
      canUse: () => true,
      manaCost: 0,
      shouldExhaust: true,
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.player.cardManager.drawIntoDestinyZone(1);
      }
    }
  ],
  tags: [],
  async onInit() {},
  async onPlay() {}
};
