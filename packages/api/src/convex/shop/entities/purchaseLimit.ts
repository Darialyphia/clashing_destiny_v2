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

export class PurchaseLimit {
  constructor(
    private limit: RawPurchaseLimit,
    private offerId: string
  ) {}

  canPurchase(transactions: Array<{ offerId: string; purchasedAt: Date }>): boolean {
    const now = new Date();

    return match(this.limit)
      .with({ type: 'lifetime' }, limit => {
        const totalPurchases = transactions.filter(
          tx => tx.offerId === this.offerId
        ).length;
        return totalPurchases < limit.max;
      })
      .with({ type: 'perDay' }, limit => {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const purchasesToday = transactions.filter(
          tx => tx.offerId === this.offerId && tx.purchasedAt >= startOfDay
        ).length;

        return purchasesToday < limit.max;
      })
      .with({ type: 'perWeek' }, limit => {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const purchasesThisWeek = transactions.filter(
          tx => tx.offerId === this.offerId && tx.purchasedAt >= startOfWeek
        ).length;

        return purchasesThisWeek < limit.max;
      })
      .exhaustive();
  }
}
