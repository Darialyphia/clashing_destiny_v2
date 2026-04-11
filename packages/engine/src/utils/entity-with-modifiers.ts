import { Entity } from '../entity';
import type { Game } from '../game/game';
import { ModifierManager } from '../modifier/modifier-manager.component';
import type { Interceptable } from '../utils/interceptable';

export abstract class EntityWithModifiers<
  TI extends Record<string, Interceptable<any, any>>
> extends Entity<TI> {
  modifiers: ModifierManager<this>;

  constructor(
    id: string,
    protected game: Game,
    interceptables: TI
  ) {
    super(id, interceptables);
    this.modifiers = new ModifierManager(game, this);
  }
}
