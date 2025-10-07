import type { Override } from '@game/shared';
import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import type { UserId } from '../../users/entities/user.entity';
import { CardCopies } from '../cardCopies';

export type CardDoc = Doc<'cards'>;
export type CardId = Id<'cards'>;
export type CardData = Override<
  CardDoc,
  {
    copiesOwned: CardCopies;
  }
>;

export class Card extends Entity<CardId, CardData> {
  static from(doc: CardDoc) {
    return new Card(doc._id, {
      ...doc,
      copiesOwned: new CardCopies(doc.copiesOwned)
    });
  }
  get blueprintId() {
    return this.data.blueprintId;
  }

  get ownerId() {
    return this.data.ownerId;
  }

  get copiesOwned() {
    return this.data.copiesOwned;
  }

  get isFoil() {
    return this.data.isFoil;
  }

  isOwnedBy(userId: UserId) {
    return this.data.ownerId === userId;
  }

  addCopies(copies: number) {
    if (copies <= 0) {
      throw new Error('Cannot add zero or negative copies');
    }
    this.data.copiesOwned.add(copies);
  }

  removeCopies(copies: number) {
    this.data.copiesOwned.remove(copies);
  }
}
