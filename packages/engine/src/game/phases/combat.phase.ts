import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.card';

export type Combatant = MinionCard | HeroCard;

export class CombatPhase implements GamePhaseController, Serializable<EmptyObject> {
  private currentRound: Combatant[] = [];

  constructor(private game: Game) {}

  async onEnter() {
    // await this.game.gamePhaseSystem.endTurn();
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
