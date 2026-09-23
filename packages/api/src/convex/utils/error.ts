import { ConvexError } from 'convex/values';

export class AppError extends ConvexError<{ message: string }> {
  constructor(message: string) {
    super({ message });
  }
}

export class DomainError extends ConvexError<{ message: string }> {
  constructor(message: string) {
    super({ message });
  }
}
