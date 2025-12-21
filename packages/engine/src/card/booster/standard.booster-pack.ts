import type { CardBlueprint } from '../card-blueprint';
import type { BoosterPack } from './booster';
import { RARITIES, type Rarity } from '../card.enums';

const DROP_RATES: Record<string, Record<string, number>> = {
  standard: {
    [RARITIES.COMMON]: 80,
    [RARITIES.RARE]: 15,
    [RARITIES.EPIC]: 4,
    [RARITIES.LEGENDARY]: 1
  },
  guaranteed_rare: {
    [RARITIES.COMMON]: 0,
    [RARITIES.RARE]: 80,
    [RARITIES.EPIC]: 15,
    [RARITIES.LEGENDARY]: 5
  }
};

const FOIL_CHANCE = 0.05;

export class StandardBoosterPack implements BoosterPack {
  private cardsByRarity: Map<Rarity, CardBlueprint[]> = new Map();

  constructor(private blueprintPool: CardBlueprint[]) {
    this.organizePool();
  }

  private organizePool() {
    Object.values(RARITIES).forEach(r => this.cardsByRarity.set(r, []));

    for (const card of this.blueprintPool) {
      if (!card.collectable) continue;
      if (card.rarity === RARITIES.BASIC || card.rarity === RARITIES.TOKEN) continue;

      const bucket = this.cardsByRarity.get(card.rarity);
      if (bucket) {
        bucket.push(card);
      }
    }
  }

  getContents(options: {
    packSize: number;
    blueprintWeightModifier: (blueprintId: string) => number;
    rarityWeightModifier: (rarity: Rarity) => number;
  }) {
    const result: Array<{ blueprintId: string; isFoil: boolean }> = [];
    const pickedIds = new Set<string>();

    for (let i = 0; i < options.packSize; i++) {
      const isHeroSlot = i === 0;
      const rates = isHeroSlot ? DROP_RATES.guaranteed_rare : DROP_RATES.standard;
      const rarity = this.rollRarity(rates, options.rarityWeightModifier);
      let card = this.pickCard(rarity, pickedIds, options.blueprintWeightModifier);

      if (!card) {
        card = this.pickFallbackCard(rarity);
      }

      if (card) {
        pickedIds.add(card.id);
        result.unshift({
          blueprintId: card.id,
          isFoil: Math.random() < FOIL_CHANCE
        });
      }
    }

    return result;
  }

  private rollRarity(
    rates: Record<string, number>,
    modifier: (rarity: Rarity) => number
  ): Rarity {
    let totalWeight = 0;
    const weightedRates: Record<string, number> = {};

    for (const [rarity, weight] of Object.entries(rates)) {
      const w = weight * modifier(rarity as Rarity);
      weightedRates[rarity] = w;
      totalWeight += w;
    }
    let random = Math.random() * totalWeight;

    for (const [rarity, weight] of Object.entries(weightedRates)) {
      random -= weight;
      if (random <= 0) {
        return rarity as Rarity;
      }
    }
    return RARITIES.COMMON;
  }

  private pickCard(
    rarity: Rarity,
    excludeIds: Set<string>,
    weightModifier: (id: string) => number
  ): CardBlueprint | null {
    const bucket = this.cardsByRarity.get(rarity) || [];
    const candidates = bucket.filter(c => !excludeIds.has(c.id));

    if (candidates.length === 0) return null;

    let totalWeight = 0;
    const weights = candidates.map(c => {
      const w = weightModifier(c.id);
      totalWeight += w;
      return w;
    });

    if (totalWeight <= 0) return null;

    let random = Math.random() * totalWeight;
    for (let i = 0; i < candidates.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return candidates[i];
      }
    }

    return candidates[candidates.length - 1];
  }

  private pickFallbackCard(rarity: Rarity): CardBlueprint | null {
    const bucket = this.cardsByRarity.get(rarity) || [];
    return bucket[Math.floor(Math.random() * bucket.length)];
  }
}
