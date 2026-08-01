import type { Game } from '../../game/game';
import type { HeroCard } from '../entities/hero.entity';
import { HERO_EVENTS, HeroStatChangeEvent } from '../events/hero.events';

export class StatsManagerComponent {
  constructor(
    private game: Game,
    private hero: HeroCard,
    private stats: {
      strength: number;
      focus: number;
      wisdom: number;
    }
  ) {}

  get strength() {
    return this.stats.strength;
  }

  get focus() {
    return this.stats.focus;
  }

  get wisdom() {
    return this.stats.wisdom;
  }

  async changeStats(diff: Partial<{ strength: number; focus: number; wisdom: number }>) {
    await this.game.emit(
      HERO_EVENTS.HERO_BEFORE_STAT_CHANGE,
      new HeroStatChangeEvent({
        card: this.hero,
        diff
      })
    );

    this.stats = {
      strength: this.stats.strength + (diff.strength || 0),
      focus: this.stats.focus + (diff.focus || 0),
      wisdom: this.stats.wisdom + (diff.wisdom || 0)
    };

    await this.game.emit(
      HERO_EVENTS.HERO_AFTER_STAT_CHANGE,
      new HeroStatChangeEvent({
        card: this.hero,
        diff
      })
    );
  }
}
