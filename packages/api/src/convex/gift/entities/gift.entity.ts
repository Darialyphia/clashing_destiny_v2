import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';

export type GiftDoc = Doc<'gifts'>;
export type GiftId = Id<'gifts'>;

export class Gift extends Entity<GiftId, GiftDoc> {
  constructor(id: Id<'gifts'>, data: GiftDoc) {
    super(id, data);
  }

  get receiverId() {
    return this.data.receiverId;
  }

  get name() {
    return this.data.name;
  }
}
