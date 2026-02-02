import { CARDS_DICTIONARY } from '../card/sets';
import { CARD_KINDS } from '../card/card.enums';
import type { MinionBlueprint } from '../card/card-blueprint';

type MinionStats = {
  count: number;
  totalAtk: number;
  totalMaxHp: number;
};

const analyzeMinions = () => {
  const minions = Object.values(CARDS_DICTIONARY).filter(
    (card): card is MinionBlueprint => card.kind === CARD_KINDS.MINION
  );

  // Group by manaCost
  const byManaCost = new Map<number, MinionStats>();
  // Group by destinyCost
  const byDestinyCost = new Map<number, MinionStats>();

  for (const minion of minions) {
    if (minion.deckSource === 'mainDeck') {
      const cost = minion.manaCost;
      const existing = byManaCost.get(cost) ?? { count: 0, totalAtk: 0, totalMaxHp: 0 };
      byManaCost.set(cost, {
        count: existing.count + 1,
        totalAtk: existing.totalAtk + minion.atk,
        totalMaxHp: existing.totalMaxHp + minion.maxHp
      });
    } else if (minion.deckSource === 'destinyDeck') {
      const cost = minion.destinyCost;
      const existing = byDestinyCost.get(cost) ?? {
        count: 0,
        totalAtk: 0,
        totalMaxHp: 0
      };
      byDestinyCost.set(cost, {
        count: existing.count + 1,
        totalAtk: existing.totalAtk + minion.atk,
        totalMaxHp: existing.totalMaxHp + minion.maxHp
      });
    }
  }

  console.log('=== MINION STATS ANALYSIS ===\n');
  console.log(`Total minions analyzed: ${minions.length}\n`);

  console.log('--- By Mana Cost (Main Deck) ---');
  const sortedManaCosts = [...byManaCost.keys()].sort((a, b) => a - b);
  for (const cost of sortedManaCosts) {
    const stats = byManaCost.get(cost)!;
    const avgAtk = (stats.totalAtk / stats.count).toFixed(1);
    const avgMaxHp = (stats.totalMaxHp / stats.count).toFixed(1);
    console.log(`Mana Cost ${cost}: ${stats.count} minion(s)\t| ${avgAtk} / ${avgMaxHp}`);
  }

  console.log('\n--- By Destiny Cost (Destiny Deck) ---');
  const sortedDestinyCosts = [...byDestinyCost.keys()].sort((a, b) => a - b);
  if (sortedDestinyCosts.length === 0) {
    console.log('No destiny deck minions found.');
  } else {
    for (const cost of sortedDestinyCosts) {
      const stats = byDestinyCost.get(cost)!;
      const avgAtk = (stats.totalAtk / stats.count).toFixed(1);
      const avgMaxHp = (stats.totalMaxHp / stats.count).toFixed(1);
      console.log(
        `Destiny Cost ${cost}: ${stats.count} minion(s)\t| ${avgAtk} / ${avgMaxHp}`
      );
    }
  }
};

analyzeMinions();
