import { AppError } from './error';

export class Email {
  constructor(private _value: string) {
    if (!this.isValid(_value)) {
      throw new AppError('Invalid email');
    }
  }

  private isValid(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  get value(): string {
    return this._value.trim().toLowerCase();
  }
}
