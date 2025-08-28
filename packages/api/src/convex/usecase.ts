import type { AnyObject } from '@game/shared';

export abstract class UseCase<TInput, TOutput, TContext extends AnyObject> {
  constructor(protected readonly ctx: TContext) {}

  abstract execute(input: TInput): Promise<TOutput>;
}
