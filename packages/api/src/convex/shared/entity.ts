import type { AnyObject } from '@game/shared';

export class Entity<TId extends string, TData extends AnyObject> {
  constructor(
    protected _id: TId,
    protected data: TData
  ) {}

  get id() {
    return this._id;
  }

  equals(entity: Entity<TId, TData>): boolean {
    return this.id === entity.id;
  }
}
