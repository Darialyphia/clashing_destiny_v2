import { AppError } from '../utils/error';

export class SpendingAmount {
  private _amount: number;
  constructor(amount: number) {
    if (amount < 0) {
      throw new AppError('Spending amount cannot be negative');
    }
    this._amount = amount;
  }

  get value(): number {
    return this._amount;
  }
}
