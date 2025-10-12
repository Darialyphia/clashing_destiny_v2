import { type EmptyObject, type Values } from '@game/shared';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { shuffleArray } from '@game/shared';
import type { Game } from '../../game/game';
import { nanoid } from 'nanoid';
import type { AnyCard, SerializedCard } from './card.entity';
import type { Player } from '../../player/player.entity';
import { EntityWithModifiers } from '../../modifier/entity-with-modifiers';

export const DECK_EVENTS = {
  BEFORE_DRAW: 'before_draw',
  AFTER_DRAW: 'after_draw'
} as const;

export type DeckEvent = Values<typeof DECK_EVENTS>;

export class DeckBeforeDrawEvent extends TypedSerializableEvent<
  { amount: number },
  { amount: number }
> {
  serialize() {
    return { amount: this.data.amount };
  }
}

export class DeckAfterDrawEvent extends TypedSerializableEvent<
  { cards: AnyCard[] },
  { cards: SerializedCard[] }
> {
  serialize() {
    return { cards: this.data.cards.map(card => card.serialize()) };
  }
}

export type DeckEventMap = {
  [DECK_EVENTS.BEFORE_DRAW]: DeckBeforeDrawEvent;
  [DECK_EVENTS.AFTER_DRAW]: DeckAfterDrawEvent;
};

export class Deck<TCard extends AnyCard> extends EntityWithModifiers<EmptyObject> {
  cards: TCard[];

  constructor(
    private game: Game,
    private player: Player
  ) {
    super(`deck_${nanoid(4)}`, {});
    this.cards = [];
  }

  get size() {
    return this.cards.length;
  }

  get remaining() {
    return this.cards.length;
  }

  populate(cards: TCard[]) {
    this.cards = cards;
  }

  shuffle() {
    this.cards = shuffleArray(this.cards, () => this.game.rngSystem.next());
  }

  draw(amount: number) {
    const cards = this.cards.splice(0, amount);

    return cards;
  }

  replace(replacedCard: TCard) {
    this.addToBottom(replacedCard);

    return this.draw(1)[0];
  }

  addToTop(card: TCard) {
    this.cards.unshift(card);
  }

  addToBottom(card: TCard) {
    this.cards.push(card);
  }

  peek(amount: number) {
    return this.cards.slice(0, amount);
  }

  pluckById(id: string) {
    const index = this.cards.findIndex(c => c.id === id);
    if (index === -1) return null;

    const [card] = this.cards.splice(index, 1);

    return card;
  }

  pluck(card: TCard) {
    this.cards = this.cards.filter(c => c !== card);
    return card;
  }
}
