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

export class WrongGamePhaseError extends Error {
  constructor() {
    super('Wrong game phase');
  }
}

export class CorruptedGamephaseContextError extends Error {
  constructor() {
    super('Corrupted game phase context');
  }
}
