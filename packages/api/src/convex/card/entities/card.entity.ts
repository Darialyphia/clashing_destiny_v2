import { assert, isDefined, type Override } from '@game/shared';
import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import type { UserId } from '../../users/entities/user.entity';
import { CardCopies } from '../cardCopies';
import { cardsBySet } from '@game/engine/src/generated/cards';
import { DECRAFTING_REWARD_PER_RARITY } from '../card.constants';

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

  get blueprint() {
    const allCards = Object.values(cardsBySet).flat();
    return allCards.find(c => c.id === this.data.blueprintId)!;
  }

  get decraftRewardPerCopy() {
    assert(isDefined(this.blueprint), new Error('Card blueprint not found'));
    return DECRAFTING_REWARD_PER_RARITY[this.blueprint.rarity];
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
