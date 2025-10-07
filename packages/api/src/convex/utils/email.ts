import { AppError } from './error';
import { z } from 'zod';
export class Email {
  constructor(private _value: string) {
    if (!this.isValid(_value)) {
      throw new AppError('Invalid email');
    }
  }

  private get schema() {
    return z.string().email();
  }

  private isValid(value: string): boolean {
    return this.schema.safeParse(value).success;
  }

  get value(): string {
    return this._value.trim().toLowerCase();
  }
}
