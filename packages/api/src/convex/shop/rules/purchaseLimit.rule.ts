import dayjs from 'dayjs';
import { match } from 'ts-pattern';

export type RawPurchaseLimit =
  | {
      type: 'lifetime';
      max: number;
    }
  | {
      type: 'perDay';
      max: number;
    }
  | {
      type: 'perWeek';
      max: number;
    };

export class PurchaseLimitRule {
  constructor(
    private limit: RawPurchaseLimit,
    private sku: string
  ) {}

  canPurchase(transactions: Array<{ sku: string; purchasedAt: Date }>): boolean {
    const now = dayjs();

    return match(this.limit)
      .with({ type: 'lifetime' }, limit => {
        const totalPurchases = transactions.filter(tx => tx.sku === this.sku).length;
        return totalPurchases < limit.max;
      })
      .with({ type: 'perDay' }, limit => {
        const startOfDay = now.startOf('day');

        const purchasesToday = transactions.filter(
          tx => tx.sku === this.sku && !dayjs(tx.purchasedAt).isBefore(startOfDay)
        ).length;

        return purchasesToday < limit.max;
      })
      .with({ type: 'perWeek' }, limit => {
        const startOfWeek = now.startOf('week');

        const purchasesThisWeek = transactions.filter(
          tx => tx.sku === this.sku && !dayjs(tx.purchasedAt).isBefore(startOfWeek)
        ).length;

        return purchasesThisWeek < limit.max;
      })
      .exhaustive();
  }
}
