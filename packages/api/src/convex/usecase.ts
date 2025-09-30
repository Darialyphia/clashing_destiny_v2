import type { MutationContainer, QueryContainer } from './shared/container';

export abstract class QueryUseCase<TInput, TOutput> {
  protected readonly ctx: QueryContainer;

  constructor(ctx: QueryContainer) {
    this.ctx = ctx;
  }

  abstract execute(input: TInput): Promise<TOutput>;
}

export abstract class MutationUseCase<TInput, TOutput> {
  protected readonly ctx: MutationContainer;

  constructor(ctx: MutationContainer) {
    this.ctx = ctx;
  }

  abstract execute(input: TInput): Promise<TOutput>;
}
