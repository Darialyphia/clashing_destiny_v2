# Error Handling

## Overview

The API uses a custom `AppError` class for domain errors that should be shown to users, while unexpected errors are logged and masked.

## AppError Class

```typescript
// utils/error.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

Usage:

```typescript
throw new AppError('Deck not found');
throw new AppError('Invalid credentials');
throw new AppError('Email already in use');
```

## Error Categories

### 1. Not Found Errors

```typescript
const deck = await this.ctx.deckRepo.getById(input.deckId);
if (!deck) {
  throw new AppError('Deck not found');
}

const user = await this.ctx.userRepo.getById(userId);
if (!user) {
  throw new AppError('User not found');
}
```

### 2. Authorization Errors

```typescript
if (deck.userId !== this.ctx.session.userId) {
  throw new AppError('You do not own this deck');
}

if (!this.ctx.session) {
  throw new AppError('Authentication required');
}

if (user.role !== 'admin') {
  throw new AppError('Admin access required');
}
```

### 3. Validation Errors

```typescript
if (input.cards.length < DECK_MIN_SIZE) {
  throw new AppError(`Deck must have at least ${DECK_MIN_SIZE} cards`);
}

if (input.password.length < PASSWORD_MIN_LENGTH) {
  throw new AppError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
}

if (!/^[a-zA-Z0-9_]+$/.test(input.username)) {
  throw new AppError('Username can only contain letters, numbers, and underscores');
}
```

### 4. Business Logic Errors

```typescript
if (lobby.players.length >= lobby.maxPlayers) {
  throw new AppError('Lobby is full');
}

if (game.status !== GAME_STATUS.ACTIVE) {
  throw new AppError('Game is not active');
}

const existing = await this.ctx.userRepo.getByEmail(input.email);
if (existing) {
  throw new AppError('Email already in use');
}
```

### 5. State Errors

```typescript
if (game.status === GAME_STATUS.FINISHED) {
  throw new AppError('Game already finished');
}

if (lobby.status !== LOBBY_STATUS.WAITING) {
  throw new AppError('Lobby is not accepting players');
}

const inQueue = await this.ctx.matchmakingRepo.getByUserId(userId);
if (inQueue) {
  throw new AppError('Already in matchmaking queue');
}
```

## Error Patterns

### Pattern 1: Guard Pattern

Extract validation into reusable guards:

```typescript
// deck/deck.guards.ts
export function ensureValidDeckSize(cards: DeckCard[]): void {
  const total = cards.reduce((sum, c) => sum + c.quantity, 0);

  if (total < DECK_MIN_SIZE) {
    throw new AppError(`Deck must have at least ${DECK_MIN_SIZE} cards`);
  }

  if (total > DECK_MAX_SIZE) {
    throw new AppError(`Deck cannot have more than ${DECK_MAX_SIZE} cards`);
  }
}

// Use in multiple places
export class CreateDeckUseCase {
  async execute(input: CreateDeckInput) {
    ensureValidDeckSize(input.cards); // Reusable validation
    // ...
  }
}
```

### Pattern 2: Value Object Validation

Validate at construction:

```typescript
export class Email {
  constructor(readonly value: string) {
    if (!value) {
      throw new AppError('Email is required');
    }

    if (!this.isValid(value)) {
      throw new AppError('Invalid email format');
    }
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Validation happens automatically
const email = new Email(input.email); // Throws if invalid
```

### Pattern 3: Early Returns

Check conditions early:

```typescript
export class UpdateDeckUseCase {
  async execute(input: UpdateDeckInput): Promise<void> {
    ensureAuthenticated(this.ctx.session);

    const deck = await this.ctx.deckRepo.getById(input.deckId);
    if (!deck) {
      throw new AppError('Deck not found');
    }

    if (deck.userId !== this.ctx.session.userId) {
      throw new AppError('Not authorized');
    }

    // Safe to proceed
    await this.ctx.deckRepo.update(input.deckId, {
      name: input.name
    });
  }
}
```

### Pattern 4: Result Types (Alternative)

For non-throwing error handling:

```typescript
type Result<T, E = string> = { success: true; data: T } | { success: false; error: E };

export class CreateDeckUseCase {
  async execute(input: CreateDeckInput): Promise<Result<DeckId>> {
    // Check user owns cards
    const userCards = await this.ctx.cardRepo.getUserCards(this.ctx.session.userId);

    for (const card of input.cards) {
      if (!userCards.some(c => c.cardId === card.cardId)) {
        return {
          success: false,
          error: `You don't own card ${card.cardId}`
        };
      }
    }

    const deckId = await this.ctx.deckRepo.create(input);
    return { success: true, data: deckId };
  }
}
```

## Error Handling in Endpoints

### Let Errors Bubble Up

```typescript
export const create = mutationWithContainer({
  args: { name: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<CreateDeckUseCase>(CreateDeckUseCase.INJECTION_KEY);

    // Don't wrap in try-catch - let AppError propagate
    return useCase.execute(args);
  }
});
```

Convex automatically catches and serializes errors for the client.

### When to Catch

Only catch when you need to transform or add context:

```typescript
export const create = mutationWithContainer({
  args: { name: v.string() },
  handler: async (container, args) => {
    try {
      const useCase = container.resolve<CreateDeckUseCase>(
        CreateDeckUseCase.INJECTION_KEY
      );
      return useCase.execute(args);
    } catch (error) {
      if (error instanceof AppError) {
        // Re-throw domain errors
        throw error;
      }

      // Log unexpected errors
      console.error('Unexpected error in create deck:', error);

      // Don't expose internal details
      throw new AppError('Failed to create deck');
    }
  }
});
```

## Client-Side Error Handling

### React Hook Example

```typescript
import { useMutation } from 'convex/react';
import { api } from '@game/api';

export function useCreateDeck() {
  const [error, setError] = useState<string | null>(null);
  const createDeck = useMutation(api.decks.create);

  const handleCreate = async (name: string, cards: any[]) => {
    try {
      setError(null);
      const result = await createDeck({ name, cards });
      return result;
    } catch (err) {
      // err.message contains the AppError message
      setError(err.message || 'Failed to create deck');
      return null;
    }
  };

  return { handleCreate, error };
}
```

### Display Errors

```tsx
function CreateDeckForm() {
  const { handleCreate, error } = useCreateDeck();

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        await handleCreate(name, cards);
      }}
    >
      {error && <div className="error-message">{error}</div>}
      {/* Form fields */}
    </form>
  );
}
```

## Error Messages

### Good Error Messages

Clear, actionable, user-friendly:

```typescript
// ✓ Good
throw new AppError('Deck must have at least 30 cards');
throw new AppError('Email already in use');
throw new AppError('Only the lobby creator can start the game');
throw new AppError('You don't own card "Fire Spell"');

// ✗ Bad
throw new AppError('Invalid');
throw new AppError('Error');
throw new AppError('Cannot proceed');
throw new AppError('Something went wrong');
```

### Include Context

```typescript
// ✓ Good - specific
throw new AppError(`Cannot have more than ${MAX_COPIES} copies of a card`);
throw new AppError(`Password must be at least ${MIN_LENGTH} characters`);
throw new AppError(`Lobby is full (${lobby.players.length}/${lobby.maxPlayers})`);

// ✗ Bad - vague
throw new AppError('Too many copies');
throw new AppError('Password too short');
throw new AppError('Lobby full');
```

## Error Codes (Optional)

For programmatic error handling:

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Usage
throw new AppError('Email already in use', 'EMAIL_IN_USE');
throw new AppError('Not found', 'NOT_FOUND');
throw new AppError('Not authorized', 'UNAUTHORIZED');

// Client can check codes
try {
  await createUser(email);
} catch (err) {
  if (err.code === 'EMAIL_IN_USE') {
    // Show specific UI for this case
  }
}
```

## Logging Errors

### In Use Cases

```typescript
export class CreateDeckUseCase {
  async execute(input: CreateDeckInput): Promise<DeckId> {
    try {
      // Business logic
      return await this.ctx.deckRepo.create(input);
    } catch (error) {
      // Log with context
      console.error('Failed to create deck:', {
        userId: this.ctx.session?.userId,
        deckName: input.name,
        cardCount: input.cards.length,
        error
      });

      throw error;
    }
  }
}
```

### In Endpoints

```typescript
export const create = mutationWithContainer({
  args: { name: v.string() },
  handler: async (container, args) => {
    try {
      const useCase = container.resolve<CreateDeckUseCase>(
        CreateDeckUseCase.INJECTION_KEY
      );
      return useCase.execute(args);
    } catch (error) {
      if (error instanceof AppError) {
        // Expected errors - don't log
        throw error;
      }

      // Unexpected errors - log
      console.error('Unexpected error:', error);
      throw new AppError('Internal server error');
    }
  }
});
```

## Testing Error Cases

```typescript
describe('CreateDeckUseCase', () => {
  it('throws when deck too small', async () => {
    const useCase = new CreateDeckUseCase({
      deckRepo: mockDeckRepo,
      session: mockSession
    });

    await expect(
      useCase.execute({
        name: 'My Deck',
        cards: [] // Too few cards
      })
    ).rejects.toThrow('Deck must have at least 30 cards');
  });

  it('throws when not authenticated', async () => {
    const useCase = new CreateDeckUseCase({
      deckRepo: mockDeckRepo,
      session: null // Not authenticated
    });

    await expect(
      useCase.execute({
        name: 'My Deck',
        cards: []
      })
    ).rejects.toThrow('Authentication required');
  });
});
```

## Best Practices

### 1. Use AppError for Domain Errors

```typescript
// ✓ Good
throw new AppError('Deck not found');

// ✗ Bad
throw new Error('Deck not found');
throw 'Deck not found';
```

### 2. Be Specific

```typescript
// ✓ Good
if (!deck) {
  throw new AppError('Deck not found');
}
if (deck.userId !== userId) {
  throw new AppError('Not authorized to update this deck');
}

// ✗ Bad
if (!deck || deck.userId !== userId) {
  throw new AppError('Cannot update deck');
}
```

### 3. Don't Catch Unless Necessary

```typescript
// ✓ Good - let errors bubble
async execute(input) {
  const result = await this.ctx.repo.create(input);
  return result;
}

// ✗ Bad - unnecessary try-catch
async execute(input) {
  try {
    const result = await this.ctx.repo.create(input);
    return result;
  } catch (error) {
    throw error; // Pointless
  }
}
```

### 4. Validate Early

```typescript
// ✓ Good
async execute(input) {
  if (input.cards.length === 0) {
    throw new AppError('Deck must have cards');
  }

  // Continue with logic
}

// ✗ Bad
async execute(input) {
  // Do expensive work
  await this.fetchRelatedData();
  await this.processCards();

  // Validate too late
  if (input.cards.length === 0) {
    throw new AppError('Deck must have cards');
  }
}
```

## Security Considerations

### Don't Expose Internal Details

```typescript
// ✓ Good
catch (error) {
  console.error('Database error:', error);
  throw new AppError('Failed to create deck');
}

// ✗ Bad - exposes internal details
catch (error) {
  throw new AppError(`Database error: ${error.message}`);
}
```

### Sanitize User Input in Errors

```typescript
// ✓ Good
throw new AppError('Invalid card ID');

// ✗ Bad - could expose injection attempts
throw new AppError(`Invalid card ID: ${input.cardId}`);
```

## Next Steps

- Learn about [Guards and Authorization](./11-guards-and-authorization.md)
- Understand [Value Objects](./10-value-objects.md)
- See [Testing Guide](./13-testing-guide.md) for testing errors
