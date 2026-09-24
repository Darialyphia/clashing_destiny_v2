import dayjs from 'dayjs';
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
        const current = dayjs(currentDate);
        const startDate = dayjs(rule.startDate);
        const endDate = dayjs(rule.endDate);
        return !current.isBefore(startDate) && !current.isAfter(endDate);
      })
      .with({ type: 'always' }, () => {
        return true;
      })
      .exhaustive();
  }
}
