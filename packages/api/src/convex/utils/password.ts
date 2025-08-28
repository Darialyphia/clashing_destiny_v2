'use node';

import { AppError } from './error';
import { Scrypt } from 'lucia';

export class Password {
  constructor(private _value: string) {
    if (!this.isValid(_value)) {
      throw new AppError('Invalid password');
    }
  }

  private isValid(value: string): boolean {
    return value.length >= 8;
  }

  get value(): string {
    return this._value;
  }

  toHash() {
    return new Scrypt().hash(this._value);
  }

  verify(hash: string) {
    return new Scrypt().verify(hash, this._value);
  }
}
