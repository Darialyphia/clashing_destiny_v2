import type { MaybePromise } from '@game/shared';
import type { Game } from './game/game';

export abstract class System<T> {
  constructor(protected game: Game) {}

  abstract initialize(options: T): MaybePromise<void>;

  abstract shutdown(): void;
}
