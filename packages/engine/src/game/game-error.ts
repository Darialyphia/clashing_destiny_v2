export class GameError extends Error {
  public isGameError = true;
  constructor(message: string) {
    super(message);
  }
}

export class IllegalGameStateError extends GameError {
  constructor(message: string) {
    super(`Illegal game state: ${message}`);
  }
}

export class CorruptedInteractionContextError extends GameError {
  constructor(expected: string, received?: string) {
    super(`Corrupted interaction context: expected ${expected}, received ${received}`);
  }
}

export class InvalidPlayerError extends GameError {
  constructor() {
    super('Invalid player trying to interact');
  }
}

export class UnableToCommitError extends GameError {
  constructor() {
    super('Unable to commit');
  }
}

export class NotEnoughCardsError extends GameError {
  constructor(expected: number, received: number) {
    super(`Not enough cards selected, expected ${expected}, received ${received}`);
  }
}

export class TooManyCardsError extends GameError {
  constructor(expected: number, received: number) {
    super(`Too many cards selected, expected ${expected}, received ${received}`);
  }
}
