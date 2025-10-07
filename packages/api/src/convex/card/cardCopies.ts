import { DomainError } from '../utils/error';

export class CardCopies {
  constructor(private copies: number) {
    if (copies < 0) {
      throw new DomainError('Copies cannot be negative');
    }
  }

  get value() {
    return this.copies;
  }

  add(copies: number) {
    if (copies < 0) {
      throw new DomainError('Copies cannot be negative');
    }
    this.copies += copies;
    return this;
  }

  remove(copies: number) {
    if (copies < 0) {
      throw new DomainError('Copies cannot be negative');
    }
    this.copies -= copies;
    return this;
  }
}
