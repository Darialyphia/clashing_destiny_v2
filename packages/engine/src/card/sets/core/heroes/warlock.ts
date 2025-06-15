import { AbilityDamage } from '../../../../utils/damage';
import type { HeroBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const warlock: HeroBlueprint = {
  id: 'warlock',
  name: 'Warlock',
  description:
    '@On Enter@ : Deal 2 damage to all minions. Gain +1 @[spellpower]@  until the end of the turn equal to the amount of minions destroyed this way.',
  cardIconId: 'hero-warlock',
  level: 3,
  destinyCost: 3,
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  unlockableAffinities: [AFFINITIES.BLOOD, AFFINITIES.VOID, AFFINITIES.FIRE],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 1,
  atk: 0,
  maxHp: 24,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      label: 'Draw 2 cards',
      description:
        '@[exhaust]@ @[mana] 2@] : Deal 3 damage to your hero and draw 2 cards.',
      id: 'warlock-ability',
      canUse: () => true,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 1,
      shouldExhaust: true,
      async onResolve(game, card) {
        await card.player.hero.takeDamage(card, new AbilityDamage(3));
        await card.player.cardManager.draw(2);
      }
    }
  ],
  tags: [],
  async onInit() {},
  async onPlay() {}
};
