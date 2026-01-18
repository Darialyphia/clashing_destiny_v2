import { asClass } from 'awilix';
import type { DependenciesMap } from '../shared/container';
import { WalletReadRepository } from './repositories/wallet-read.repository';
import { WalletRepository } from './repositories/wallet.repository';
import { TransactionReadRepository } from './repositories/transaction-read.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { GetWalletBalanceUseCase } from './usecases/getWalletBalance.usecase';
import { AwardCurrencyUseCase } from './usecases/awardCurrency.usecase';
import { SpendCurrencyUseCase } from './usecases/spendCurrency.usecase';
import { GetTransactionHistoryUseCase } from './usecases/getTransactionHistory.usecase';
import { CreateMissingWalletsUseCase } from './usecases/createMissingWallets.usecase';
import { WalletMapper } from './mappers/wallet.mapper';

export const queryDependencies = {
  [WalletReadRepository.INJECTION_KEY]: { resolver: asClass(WalletReadRepository) },
  [TransactionReadRepository.INJECTION_KEY]: {
    resolver: asClass(TransactionReadRepository)
  },
  [GetWalletBalanceUseCase.INJECTION_KEY]: { resolver: asClass(GetWalletBalanceUseCase) },
  [GetTransactionHistoryUseCase.INJECTION_KEY]: {
    resolver: asClass(GetTransactionHistoryUseCase)
  }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [WalletRepository.INJECTION_KEY]: { resolver: asClass(WalletRepository) },
  [TransactionRepository.INJECTION_KEY]: { resolver: asClass(TransactionRepository) },
  [AwardCurrencyUseCase.INJECTION_KEY]: { resolver: asClass(AwardCurrencyUseCase) },
  [SpendCurrencyUseCase.INJECTION_KEY]: { resolver: asClass(SpendCurrencyUseCase) },
  [CreateMissingWalletsUseCase.INJECTION_KEY]: {
    resolver: asClass(CreateMissingWalletsUseCase)
  },
  [WalletMapper.INJECTION_KEY]: { resolver: asClass(WalletMapper) }
} as const satisfies DependenciesMap;
