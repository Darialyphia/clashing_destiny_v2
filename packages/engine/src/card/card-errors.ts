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

export class NotEnoughCardsInDestinyZoneError extends InputError {
  constructor() {
    super('Not enough cards in destiny zone.');
  }
}

export class NotEnoughCardsInHandError extends InputError {
  constructor() {
    super('Not enough cards in hand.');
  }
}

export class NoTalentSlotAvailableError extends InputError {
  constructor() {
    super('No talent slot available.');
  }
}
