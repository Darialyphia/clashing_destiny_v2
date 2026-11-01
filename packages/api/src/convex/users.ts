import { v } from 'convex/values';
import { mutationWithContainer, queryWithContainer } from './shared/container';
import { GetUserSettingsUseCase } from './users/usecases/getUserSettings.usecase';
import { SaveUserSettingsUseCase } from './users/usecases/saveUserSettings.usecase';

export const settings = queryWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<GetUserSettingsUseCase>(
      GetUserSettingsUseCase.INJECTION_KEY
    );

    return usecase.execute();
  }
});

export const saveSettings = mutationWithContainer({
  args: {
    version: v.number(),
    settings: v.record(v.string(), v.any())
  },
  handler: async (ctx, args) => {
    const usecase = ctx.resolve<SaveUserSettingsUseCase>(
      SaveUserSettingsUseCase.INJECTION_KEY
    );

    return usecase.execute({ version: args.version, settings: args.settings });
  }
});
