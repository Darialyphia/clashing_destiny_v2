import { GetDecksUseCase } from './deck/usecases/getDecks.usecase';
import { queryWithContainer } from './shared/container';

export const list = queryWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<GetDecksUseCase>(GetDecksUseCase.INJECTION_KEY);

    return usecase.execute();
  }
});
