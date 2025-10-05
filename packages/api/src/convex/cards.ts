import { GetMyCollectionUseCase } from './card/usecases/getMyCollection.usecase';
import { queryWithContainer } from './shared/container';

export const myCollection = queryWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<GetMyCollectionUseCase>(
      GetMyCollectionUseCase.INJECTION_KEY
    );

    return usecase.execute();
  }
});
