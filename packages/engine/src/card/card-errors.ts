import { GameError } from '../game/game-error';
import { InputError } from '../input/input-errors';

export class WrongCardSourceError extends GameError {
  constructor() {
    super('Wrong card source.');
  }
}

export class CardNotFoundError extends GameError {
  constructor() {
    super('Card not found.');
  }
}

export class NotEnoughCardsInHandError extends InputError {
  constructor() {
    super('Not enough cards in hand.');
  }
}
