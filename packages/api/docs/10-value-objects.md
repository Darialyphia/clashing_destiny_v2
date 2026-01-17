# Value Objects

## Overview

Value Objects are immutable objects that represent domain concepts through their value rather than identity. They encapsulate validation logic and provide type safety.

## Purpose

```typescript
// Without value objects
function createUser(email: string) {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
  // Use email
}

// With value objects
function createUser(email: Email) {
  // Email is already validated!
  // Use email.value
}
```

Benefits:

- Validation at construction time
- Type safety - can't mix up strings
- Self-documenting code
- Reusable validation logic
- Immutability by design

## Basic Structure

```typescript
export class Email {
  constructor(readonly value: string) {
    if (!this.isValid(value)) {
      throw new AppError('Invalid email format');
    }
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

## Real-World Examples

### Example 1: Email

```typescript
// utils/email.ts
export class Email {
  constructor(readonly value: string) {
    if (!value) {
      throw new AppError('Email is required');
    }

    if (!this.isValid(value)) {
      throw new AppError('Invalid email format');
    }

    // Normalize
    this.value = value.toLowerCase().trim();
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getDomain(): string {
    return this.value.split('@')[1];
  }

  isGmail(): boolean {
    return this.getDomain() === 'gmail.com';
  }
}
```

Usage:

```typescript
const email = new Email('user@example.com');
console.log(email.value); // 'user@example.com'
console.log(email.getDomain()); // 'example.com'
console.log(email.isGmail()); // false
```

### Example 2: Password

```typescript
// utils/password.ts
import { hash, verify } from '@node-rs/argon2';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export class Password {
  constructor(readonly value: string) {
    if (value.length < PASSWORD_MIN_LENGTH) {
      throw new AppError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    }

    if (value.length > PASSWORD_MAX_LENGTH) {
      throw new AppError(`Password must be at most ${PASSWORD_MAX_LENGTH} characters`);
    }

    // Could add more validation:
    // - Require uppercase
    // - Require numbers
    // - Require special characters
  }

  async hash(): Promise<string> {
    return await hash(this.value, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });
  }

  async verify(hashedPassword: string): Promise<boolean> {
    try {
      return await verify(hashedPassword, this.value);
    } catch {
      return false;
    }
  }

  get strength(): 'weak' | 'medium' | 'strong' {
    const hasUppercase = /[A-Z]/.test(this.value);
    const hasLowercase = /[a-z]/.test(this.value);
    const hasNumbers = /[0-9]/.test(this.value);
    const hasSpecial = /[^A-Za-z0-9]/.test(this.value);
    const isLong = this.value.length >= 12;

    const score = [hasUppercase, hasLowercase, hasNumbers, hasSpecial, isLong].filter(
      Boolean
    ).length;

    if (score >= 4) return 'strong';
    if (score >= 2) return 'medium';
    return 'weak';
  }
}
```

### Example 3: Username

```typescript
// users/username.ts
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

export class Username {
  constructor(readonly value: string) {
    if (value.length < USERNAME_MIN_LENGTH) {
      throw new AppError(`Username must be at least ${USERNAME_MIN_LENGTH} characters`);
    }

    if (value.length > USERNAME_MAX_LENGTH) {
      throw new AppError(`Username must be at most ${USERNAME_MAX_LENGTH} characters`);
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      throw new AppError('Username can only contain letters, numbers, and underscores');
    }

    if (/^[0-9]/.test(value)) {
      throw new AppError('Username cannot start with a number');
    }

    // Normalize
    this.value = value.toLowerCase();
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }
}
```

### Example 4: Money

```typescript
// Example for future features
export class Money {
  constructor(
    readonly amount: number,
    readonly currency: string = 'USD'
  ) {
    if (amount < 0) {
      throw new AppError('Amount cannot be negative');
    }

    if (!Number.isFinite(amount)) {
      throw new AppError('Amount must be a finite number');
    }

    // Round to 2 decimal places
    this.amount = Math.round(amount * 100) / 100;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new AppError('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new AppError('Cannot subtract money with different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  format(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency
    }).format(this.amount);
  }
}
```

### Example 5: DateRange

```typescript
export class DateRange {
  constructor(
    readonly start: Date,
    readonly end: Date
  ) {
    if (start >= end) {
      throw new AppError('Start date must be before end date');
    }
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  overlaps(other: DateRange): boolean {
    return this.start <= other.end && this.end >= other.start;
  }

  getDurationMs(): number {
    return this.end.getTime() - this.start.getTime();
  }

  getDurationDays(): number {
    return Math.floor(this.getDurationMs() / (1000 * 60 * 60 * 24));
  }
}
```

## Using Value Objects

### In API Endpoints

```typescript
export const register = mutationWithContainer({
  args: {
    email: v.string(),
    password: v.string(),
    username: v.string()
  },
  handler: async (container, input) => {
    // Convert to value objects - validation happens here
    const email = new Email(input.email);
    const password = new Password(input.password);
    const username = new Username(input.username);

    const useCase = container.resolve<RegisterUseCase>(RegisterUseCase.INJECTION_KEY);

    return useCase.execute({ email, password, username });
  }
});
```

### In Use Cases

```typescript
export interface RegisterInput {
  email: Email; // Not string!
  password: Password;
  username: Username;
}

export class RegisterUseCase {
  async execute(input: RegisterInput): Promise<RegisterOutput> {
    // Check email uniqueness
    const existing = await this.ctx.userRepo.getByEmail(input.email);
    if (existing) {
      throw new AppError('Email already in use');
    }

    // Hash password (method on Password value object)
    const hashedPassword = await input.password.hash();

    // Create user
    const userId = await this.ctx.userRepo.create({
      email: input.email,
      username: input.username,
      hashedPassword
    });

    return { userId };
  }
}
```

### In Repositories

```typescript
export class UserRepository {
  async getByEmail(email: Email): Promise<User | null> {
    return this.ctx.db
      .query('users')
      .withIndex('email', q => q.eq('email', email.value))
      .unique();
  }

  async create(data: {
    email: Email;
    username: Username;
    hashedPassword: string;
  }): Promise<UserId> {
    return this.ctx.db.insert('users', {
      email: data.email.value,
      username: data.username.value,
      hashedPassword: data.hashedPassword,
      createdAt: Date.now()
    });
  }
}
```

## Value Object Patterns

### Pattern 1: Static Factory Methods

```typescript
export class Email {
  private constructor(readonly value: string) {
    // Private constructor
  }

  static create(value: string): Email | null {
    try {
      return new Email(value);
    } catch {
      return null;
    }
  }

  static createOrThrow(value: string): Email {
    return new Email(value);
  }
}

// Usage
const email = Email.create('user@example.com');
if (email) {
  // Valid email
}
```

### Pattern 2: Validation Methods

```typescript
export class Email {
  constructor(readonly value: string) {
    Email.validate(value);
  }

  static validate(value: string): void {
    if (!value) {
      throw new AppError('Email is required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new AppError('Invalid email format');
    }
  }

  static isValid(value: string): boolean {
    try {
      Email.validate(value);
      return true;
    } catch {
      return false;
    }
  }
}
```

### Pattern 3: Equality Methods

```typescript
export class Username {
  constructor(readonly value: string) {
    // ...
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }

  equalsIgnoreCase(other: Username): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
```

### Pattern 4: Conversion Methods

```typescript
export class DateRange {
  constructor(
    readonly start: Date,
    readonly end: Date
  ) {}

  toISOStrings(): { start: string; end: string } {
    return {
      start: this.start.toISOString(),
      end: this.end.toISOString()
    };
  }

  toTimestamps(): { start: number; end: number } {
    return {
      start: this.start.getTime(),
      end: this.end.getTime()
    };
  }

  static fromTimestamps(start: number, end: number): DateRange {
    return new DateRange(new Date(start), new Date(end));
  }
}
```

## Benefits in Practice

### Type Safety

```typescript
// Without value objects - easy to mix up
function sendEmail(to: string, from: string, subject: string) {
  // Which parameter is which?
}

sendEmail(subject, from, to); // Oops! Wrong order

// With value objects - impossible to mix up
function sendEmail(to: Email, from: Email, subject: Subject) {}

sendEmail(
  new Email('to@example.com'),
  new Email('from@example.com'),
  new Subject('Hello')
); // ✓ Type safe
```

### Encapsulated Logic

```typescript
// Without value objects - validation scattered
function createUser(email: string) {
  if (!email.includes('@')) throw new Error('Invalid email');
  // ...
}

function updateUser(email: string) {
  if (!email.includes('@')) throw new Error('Invalid email');
  // ...
}

// With value objects - validation in one place
function createUser(email: Email) {
  // Already validated
}

function updateUser(email: Email) {
  // Already validated
}
```

### Self-Documenting

```typescript
// Less clear
function calculateDiscount(price: number, percent: number): number;

// More clear
function calculateDiscount(price: Money, discount: Percentage): Money;
```

## Testing Value Objects

```typescript
describe('Password', () => {
  it('validates minimum length', () => {
    expect(() => new Password('short')).toThrow('Password must be at least 8 characters');
  });

  it('validates maximum length', () => {
    const longPassword = 'a'.repeat(129);
    expect(() => new Password(longPassword)).toThrow(
      'Password must be at most 128 characters'
    );
  });

  it('hashes password', async () => {
    const password = new Password('password123');
    const hashed = await password.hash();

    expect(hashed).toBeTruthy();
    expect(hashed).not.toBe('password123');
  });

  it('verifies correct password', async () => {
    const password = new Password('password123');
    const hashed = await password.hash();

    const isValid = await password.verify(hashed);
    expect(isValid).toBe(true);
  });

  it('rejects incorrect password', async () => {
    const password = new Password('password123');
    const wrongPassword = new Password('wrong');
    const hashed = await password.hash();

    const isValid = await wrongPassword.verify(hashed);
    expect(isValid).toBe(false);
  });

  it('calculates password strength', () => {
    expect(new Password('password').strength).toBe('weak');
    expect(new Password('Password1').strength).toBe('medium');
    expect(new Password('P@ssw0rd!123').strength).toBe('strong');
  });
});
```

## Best Practices

### 1. Make Them Immutable

```typescript
// Good: readonly properties
export class Email {
  constructor(readonly value: string) {}
}

// Bad: Mutable
export class Email {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  setValue(newValue: string) {
    this.value = newValue; // Mutation!
  }
}
```

### 2. Validate in Constructor

```typescript
// Good: Fail fast
export class Email {
  constructor(readonly value: string) {
    if (!this.isValid(value)) {
      throw new AppError('Invalid email');
    }
  }
}

// Bad: Validation elsewhere
export class Email {
  constructor(readonly value: string) {}

  isValid(): boolean {
    // User has to remember to call this
  }
}
```

### 3. Keep Them Simple

```typescript
// Good: Focused on one concept
export class Email {
  constructor(readonly value: string) {}
}

// Bad: Too many responsibilities
export class Email {
  constructor(readonly value: string) {}

  send(to: Email, subject: string) {}
  validate() {}
  format() {}
  checkSpam() {}
}
```

### 4. Use Meaningful Names

```typescript
// Good
export class Email {}
export class Password {}
export class Username {}

// Bad
export class StringValidator {}
export class TextValue {}
```

## Common Pitfalls

### ❌ Forgetting to Use .value

```typescript
// Bad
const user = await userRepo.getByEmail(email); // Wrong!

// Good
const user = await userRepo.getByEmail(email.value); // ✓
```

### ❌ Not Validating

```typescript
// Bad: No validation
export class Email {
  constructor(readonly value: string) {}
}

// Good: Validate
export class Email {
  constructor(readonly value: string) {
    if (!this.isValid(value)) {
      throw new AppError('Invalid email');
    }
  }
}
```

### ❌ Adding Business Logic

```typescript
// Bad: Business logic in value object
export class Email {
  async sendVerification() {
    // Business logic doesn't belong here
  }
}

// Good: Keep it simple
export class Email {
  constructor(readonly value: string) {}

  getDomain(): string {
    return this.value.split('@')[1];
  }
}
```

## Next Steps

- Learn about [Authentication](./07-authentication.md)
- Understand [Error Handling](./12-error-handling.md)
- See [Common Tasks](./15-common-tasks.md) for creating value objects
