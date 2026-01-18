import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import type { UserId } from '../../users/entities/user.entity';

export type TransactionId = Id<'currencyTransactions'>;
export type TransactionDoc = Doc<'currencyTransactions'>;

export class CurrencyTransaction extends Entity<TransactionId, TransactionDoc> {
  get userId() {
    return this.data.userId as UserId;
  }
  get currencyType() {
    return this.data.currencyType;
  }
  get amount() {
    return this.data.amount;
  }
  get balanceBefore() {
    return this.data.balanceBefore;
  }
  get balanceAfter() {
    return this.data.balanceAfter;
  }
  get source() {
    return this.data.source;
  }
  get sourceId() {
    return this.data.sourceId;
  }
  get metadata() {
    return this.data.metadata;
  }
  get createdAt() {
    return this.data.createdAt;
  }
}
