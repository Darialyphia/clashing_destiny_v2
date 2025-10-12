import { Entity } from '../entity';
import type { Interceptable } from '../utils/interceptable';
import { ModifierManager } from './modifier-manager.component';

export abstract class EntityWithModifiers<
  TI extends Record<string, Interceptable<any, any>>
> extends Entity<TI> {
  modifiers: ModifierManager<this>;

  constructor(id: string, interceptables: TI) {
    super(id, interceptables);
    this.modifiers = new ModifierManager(this);
  }
}
