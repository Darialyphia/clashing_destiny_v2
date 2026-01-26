import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import { AppError, DomainError } from '../../utils/error';
import type { CardRepository } from '../repositories/card.repository';
import type { WalletRepository } from '../../currency/repositories/wallet.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import { assert, isDefined } from '@game/shared';
import { cardsBySet } from '@game/engine/src/generated/cards';
import {
  CRAFTING_COST_PER_RARITY,
  FOIL_CRAFTING_COST_MULTIPLIER
} from '../card.constants';
import { CURRENCY_TYPES } from '../../currency/currency.constants';
import type { SpendCurrencyUseCase } from '../../currency/usecases/spendCurrency.usecase';

export interface CraftCardInput {
  blueprintId: string;
  isFoil: boolean;
}

export interface CraftCardOutput {
  cardId: string;
  craftingShardsCost: number;
}

export class CraftCardUseCase implements UseCase<CraftCardInput, CraftCardOutput> {
  static INJECTION_KEY = 'craftCardUseCase' as const;

  constructor(
    protected ctx: {
      session: AuthSession | null;
      cardRepo: CardRepository;
      walletRepo: WalletRepository;
      eventEmitter: EventEmitter;
      spendCurrencyUseCase: SpendCurrencyUseCase;
    }
  ) {}

  async execute(input: CraftCardInput): Promise<CraftCardOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const allCards = Object.values(cardsBySet).flat();
    const blueprint = allCards.find(card => card.id === input.blueprintId);
    assert(isDefined(blueprint), new AppError('Card blueprint not found'));
    assert(
      blueprint.collectable,
      new DomainError('This card cannot be crafted (not collectable)')
    );

    const multiplier = input.isFoil ? FOIL_CRAFTING_COST_MULTIPLIER : 1;
    const craftingCost = CRAFTING_COST_PER_RARITY[blueprint.rarity] * multiplier;
    assert(
      craftingCost > 0,
      new DomainError('This card cannot be crafted (no crafting cost)')
    );

    const wallet = await this.ctx.walletRepo.getByUserId(session.userId);
    assert(isDefined(wallet), new AppError('User wallet not found'));
    assert(
      wallet.craftingShards >= craftingCost,
      new DomainError(
        `Insufficient crafting shards. Required: ${craftingCost}, Available: ${wallet.craftingShards}`
      )
    );

    await this.ctx.spendCurrencyUseCase.execute({
      purpose: `Crafting card ${input.blueprintId}`,
      amount: craftingCost,
      currencyType: CURRENCY_TYPES.CRAFTING_SHARDS
    });

    const cardId = await this.ctx.cardRepo.create({
      ownerId: session.userId,
      blueprintId: input.blueprintId,
      isFoil: input.isFoil,
      copiesOwned: 1
    });

    return {
      cardId,
      craftingShardsCost: craftingCost
    };
  }
}
