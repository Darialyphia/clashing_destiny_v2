import type { Game } from '../../game/game';
import type { HeroCard } from '../entities/hero.entity';
import { HERO_EVENTS, HeroStatChangeEvent } from '../events/hero.events';

export class StatsManagerComponent {
  private stats: {
    might: number;
    focus: number;
    wisdom: number;
  };

  constructor(
    private game: Game,
    private card: HeroCard,
    initialStats: { might: number; focus: number; wisdom: number }
  ) {
    this.stats = initialStats;
  }

  get might() {
    return this.stats.might;
  }

  get focus() {
    return this.stats.focus;
  }

  get wisdom() {
    return this.stats.wisdom;
  }

  async changeMight(amount: number) {
    this.stats.might += amount;

    await this.game.emit(
      HERO_EVENTS.HERO_STAT_CHANGED,
      new HeroStatChangeEvent({ card: this.card, stat: 'might', amount })
    );
  }

  async changeFocus(amount: number) {
    this.stats.focus += amount;

    await this.game.emit(
      HERO_EVENTS.HERO_STAT_CHANGED,
      new HeroStatChangeEvent({ card: this.card, stat: 'focus', amount })
    );
  }

  async changeWisdom(amount: number) {
    this.stats.wisdom += amount;

    await this.game.emit(
      HERO_EVENTS.HERO_STAT_CHANGED,
      new HeroStatChangeEvent({ card: this.card, stat: 'wisdom', amount })
    );
  }
}
