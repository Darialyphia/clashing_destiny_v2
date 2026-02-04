import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { Damage } from '../../utils/damage';
import type { CardAfterTakeDamageEvent } from '../card.events';
import type { HeroCard } from '../entities/hero.entity';
import type { MinionCard } from '../entities/minion.entity';

export class DamageTrackerComponent {
  private damageTakenThisTurnPerTurn: number[] = [];
  private damageInstancesPerTurn: Damage[][] = [];

  constructor(
    private game: Game,
    private owner: MinionCard | HeroCard
  ) {
    this.onDamageTaken = this.onDamageTaken.bind(this);
    this.game.on(GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE, this.onDamageTaken);
  }

  private onDamageTaken(event: CardAfterTakeDamageEvent) {
    if (!event.data.card.equals(this.owner)) return;
    const currentTurn = this.game.turnSystem.elapsedTurns;
    const damage = this.damageTakenThisTurnPerTurn[currentTurn] || 0;
    this.damageTakenThisTurnPerTurn[currentTurn] =
      damage + event.data.damage.getFinalAmount(this.owner);
    const damageInstances = this.damageInstancesPerTurn[currentTurn] || [];
    damageInstances.push(event.data.damage);
    this.damageInstancesPerTurn[currentTurn] = damageInstances;
  }

  get damageTakenThisTurn(): number {
    const currentTurn = this.game.turnSystem.elapsedTurns;
    return this.damageTakenThisTurnPerTurn[currentTurn] || 0;
  }

  get damageInstancesThisTurn(): Damage[] {
    const currentTurn = this.game.turnSystem.elapsedTurns;
    return this.damageInstancesPerTurn[currentTurn] || [];
  }

  getDamageTakenForTurn(turn: number): number {
    return this.damageTakenThisTurnPerTurn[turn] || 0;
  }

  getDamageInstancesForTurn(turn: number): Damage[] {
    return this.damageInstancesPerTurn[turn] || [];
  }
}
