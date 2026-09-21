import { match } from 'ts-pattern';

export type RawAvailabilityRule =
  | {
      type: 'dateRange';
      startDate: string;
      endDate: string;
    }
  | {
      type: 'always';
    };

export class AvailabilityRule {
  constructor(private rule: RawAvailabilityRule) {}

  isAvailable(currentDate: Date): boolean {
    return match(this.rule)
      .with({ type: 'dateRange' }, rule => {
        const startDate = new Date(rule.startDate);
        const endDate = new Date(rule.endDate);
        return (
          currentDate.getTime() >= startDate.getTime() &&
          currentDate.getTime() <= endDate.getTime()
        );
      })
      .with({ type: 'always' }, () => {
        return true;
      })
      .exhaustive();
  }
}
