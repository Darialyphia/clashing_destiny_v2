import { RUNES, type RuneId } from '../../card/card.enums';
import { RuneCard } from '../../card/entities/rune.entity';
import type { Game } from '../../game/game';
import type { Player } from '../player.entity';

export class RuneManagerComponent {
  constructor(
    private game: Game,
    private player: Player
  ) {}

  get runes() {
    const cards = this.player.cardManager.runeZone;
    const runeCounts: Record<RuneId, number> = {
      [RUNES.RED.id]: 0,
      [RUNES.BLUE.id]: 0,
      [RUNES.YELLOW.id]: 0,
      [RUNES.GREEN.id]: 0,
      [RUNES.PURPLE.id]: 0,
      [RUNES.COLORLESS.id]: 0
    };

    cards.forEach(card => {
      if (card instanceof RuneCard) {
        card.runeProduction.forEach(rune => {
          runeCounts[rune]++;
        });
      }
    });

    return runeCounts;
  }

  satisfiesRuneCost(cost: Partial<Record<RuneId, number>>) {
    const { COLORLESS, ...coloredRunes } = cost;
    const used: Record<Exclude<RuneId, 'COLORLESS'>, number> = {
      [RUNES.RED.id]: 0,
      [RUNES.BLUE.id]: 0,
      [RUNES.YELLOW.id]: 0,
      [RUNES.GREEN.id]: 0,
      [RUNES.PURPLE.id]: 0
    };
    for (const [runeType, amount] of Object.entries(coloredRunes)) {
      const available = this.runes[runeType as RuneId];
      if (available < amount!) {
        return false;
      }
      used[runeType as Exclude<RuneId, 'COLORLESS'>] = amount!;
    }

    const totalUsed = Object.values(used).reduce((sum, val) => sum + val, 0);
    const remaining =
      Object.values(this.runes).reduce((sum, val) => sum + val, 0) - totalUsed;

    return remaining >= (COLORLESS ?? 0);
  }
}
