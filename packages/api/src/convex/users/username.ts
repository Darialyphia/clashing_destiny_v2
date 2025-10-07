import { z } from 'zod';
import { AppError } from '../utils/error';
import slugify from 'slugify';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;

export class Username {
  constructor(private _value: string) {
    if (!this.isValid(_value)) {
      throw new AppError('Invalid username');
    }
  }

  get schema() {
    return z.string().trim().min(USERNAME_MIN_LENGTH).max(USERNAME_MAX_LENGTH);
  }

  private isValid(value: string): boolean {
    return this.schema.safeParse(value).success;
  }

  get value(): string {
    return this._value;
  }

  toSlug(): string {
    return slugify(this._value, { lower: true });
  }
}
