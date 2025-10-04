'use node';

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../auth/auth.constants';
import { AppError } from './error';
import { Scrypt } from 'lucia';

export class Password {
  constructor(private _value: string) {
    if (!this.isValid(_value)) {
      throw new AppError('Invalid password');
    }
  }

  private isValid(value: string): boolean {
    return value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;
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
