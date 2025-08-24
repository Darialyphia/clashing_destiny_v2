import type { AnyObject } from '@game/shared';

export type UseCase<TInput, TOutput, TContext extends AnyObject> = {
  execute: (input: TInput, ctx: TContext) => Promise<TOutput>;
};
