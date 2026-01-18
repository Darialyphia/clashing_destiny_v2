import { v } from 'convex/values';
import { queryWithContainer, internalMutationWithContainer } from './shared/container';
import { GetWalletBalanceUseCase } from './currency/usecases/getWalletBalance.usecase';
import { SpendCurrencyUseCase } from './currency/usecases/spendCurrency.usecase';
import { GetTransactionHistoryUseCase } from './currency/usecases/getTransactionHistory.usecase';
import { AwardCurrencyUseCase } from './currency/usecases/awardCurrency.usecase';
import { CreateMissingWalletsUseCase } from './currency/usecases/createMissingWallets.usecase';
// import { CreateMissingWalletsUseCase } from './currency/usecases/createMissingWallets.usecase';

export const balance = queryWithContainer({
  args: {},
  handler: async container => {
    const useCase = container.resolve<GetWalletBalanceUseCase>(
      GetWalletBalanceUseCase.INJECTION_KEY
    );
    return useCase.execute({});
  }
});

export const history = queryWithContainer({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (container, args) => {
    const useCase = container.resolve<GetTransactionHistoryUseCase>(
      GetTransactionHistoryUseCase.INJECTION_KEY
    );
    return useCase.execute({ limit: args.limit });
  }
});

export const spendInternal = internalMutationWithContainer({
  args: {
    amount: v.number(),
    currencyType: v.string(),
    purpose: v.string(),
    metadata: v.optional(v.any())
  },
  handler: async (container, args) => {
    const useCase = container.resolve<SpendCurrencyUseCase>(
      SpendCurrencyUseCase.INJECTION_KEY
    );
    return useCase.execute({
      amount: args.amount,
      currencyType: args.currencyType as any,
      purpose: args.purpose,
      metadata: args.metadata
    });
  }
});

export const grantInternal = internalMutationWithContainer({
  args: {
    userId: v.id('users'),
    amount: v.number(),
    currencyType: v.string(),
    source: v.string(),
    sourceId: v.optional(v.string()),
    metadata: v.optional(v.any())
  },
  handler: async (container, args) => {
    const useCase = container.resolve<AwardCurrencyUseCase>(
      AwardCurrencyUseCase.INJECTION_KEY
    );
    return useCase.execute({
      userId: args.userId,
      amount: args.amount,
      currencyType: args.currencyType as any,
      source: args.source as any,
      sourceId: args.sourceId,
      metadata: args.metadata
    });
  }
});

export const createMissingWalletsInternal = internalMutationWithContainer({
  args: {},
  handler: async container => {
    const useCase = container.resolve<CreateMissingWalletsUseCase>(
      CreateMissingWalletsUseCase.INJECTION_KEY
    );
    return useCase.execute();
  }
});
