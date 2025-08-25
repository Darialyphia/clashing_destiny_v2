import { ConvexError } from 'convex/values';

export class AppError extends ConvexError<string> {}

export class DomainError extends ConvexError<string> {}
