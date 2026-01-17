# Testing Guide

## Overview

Testing ensures code reliability and makes refactoring safer. The API architecture with dependency injection makes testing straightforward.

## Testing Strategy

### Test Pyramid

```
       E2E Tests (few)
    Integration Tests (some)
  Unit Tests (many)
```

- **Unit Tests**: Test individual classes (use cases, repositories, value objects)
- **Integration Tests**: Test multiple components together
- **E2E Tests**: Test entire flows through API

## Unit Testing

### Testing Use Cases

Use cases are highly testable due to dependency injection:

```typescript
import { CreateDeckUseCase } from './createDeck.usecase';
import { AppError } from '../../utils/error';

describe('CreateDeckUseCase', () => {
  let useCase: CreateDeckUseCase;
  let mockDeckRepo: jest.Mocked<DeckRepository>;
  let mockCardRepo: jest.Mocked<CardRepository>;
  let mockSession: AuthSession;

  beforeEach(() => {
    // Create mocks
    mockDeckRepo = {
      create: jest.fn(),
      getByUserId: jest.fn()
    } as any;

    mockCardRepo = {
      getUserCards: jest.fn()
    } as any;

    mockSession = {
      _id: 'session_123' as SessionId,
      userId: 'user_123' as UserId,
      expirationTime: Date.now() + 1000000,
      lastVerifiedTime: Date.now()
    } as AuthSession;

    // Create use case with mocks
    useCase = new CreateDeckUseCase({
      deckRepo: mockDeckRepo,
      cardRepo: mockCardRepo,
      session: mockSession
    });
  });

  it('creates a deck', async () => {
    const cards = [
      { cardId: 'card_1', quantity: 3 },
      { cardId: 'card_2', quantity: 2 }
    ];

    mockCardRepo.getUserCards.mockResolvedValue([
      { cardId: 'card_1' },
      { cardId: 'card_2' }
    ] as any);

    mockDeckRepo.create.mockResolvedValue('deck_123' as DeckId);

    const result = await useCase.execute({
      name: 'My Deck',
      cards
    });

    expect(result).toBe('deck_123');
    expect(mockDeckRepo.create).toHaveBeenCalledWith({
      userId: 'user_123',
      name: 'My Deck',
      cards,
      isValid: true,
      createdAt: expect.any(Number)
    });
  });

  it('throws when not authenticated', async () => {
    useCase = new CreateDeckUseCase({
      deckRepo: mockDeckRepo,
      cardRepo: mockCardRepo,
      session: null // Not authenticated
    });

    await expect(
      useCase.execute({
        name: 'My Deck',
        cards: []
      })
    ).rejects.toThrow('Authentication required');
  });

  it('throws when user does not own cards', async () => {
    const cards = [{ cardId: 'card_1', quantity: 3 }];

    // User doesn't own card_1
    mockCardRepo.getUserCards.mockResolvedValue([]);

    await expect(
      useCase.execute({
        name: 'My Deck',
        cards
      })
    ).rejects.toThrow("You don't own card card_1");
  });

  it('throws when deck is too small', async () => {
    mockCardRepo.getUserCards.mockResolvedValue([{ cardId: 'card_1' }] as any);

    await expect(
      useCase.execute({
        name: 'My Deck',
        cards: [{ cardId: 'card_1', quantity: 10 }] // Too few
      })
    ).rejects.toThrow('Deck must have at least 30 cards');
  });
});
```

### Testing Repositories

Test data access logic:

```typescript
describe('DeckRepository', () => {
  let repository: DeckRepository;
  let mockDb: jest.Mocked<DatabaseWriter>;

  beforeEach(() => {
    mockDb = {
      insert: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      query: jest.fn()
    } as any;

    repository = new DeckRepository({ db: mockDb });
  });

  it('creates a deck', async () => {
    mockDb.insert.mockResolvedValue('deck_123' as DeckId);

    const deckId = await repository.create({
      userId: 'user_123' as UserId,
      name: 'Test Deck',
      cards: [],
      isValid: true,
      createdAt: Date.now()
    });

    expect(deckId).toBe('deck_123');
    expect(mockDb.insert).toHaveBeenCalledWith('decks', {
      userId: 'user_123',
      name: 'Test Deck',
      cards: [],
      isValid: true,
      createdAt: expect.any(Number)
    });
  });

  it('gets deck by id', async () => {
    const mockDeck = {
      _id: 'deck_123',
      name: 'Test Deck'
    } as Deck;

    mockDb.get.mockResolvedValue(mockDeck);

    const deck = await repository.getById('deck_123' as DeckId);

    expect(deck).toEqual(mockDeck);
    expect(mockDb.get).toHaveBeenCalledWith('deck_123');
  });

  it('updates a deck', async () => {
    await repository.update('deck_123' as DeckId, {
      name: 'Updated Name'
    });

    expect(mockDb.patch).toHaveBeenCalledWith('deck_123', {
      name: 'Updated Name'
    });
  });
});
```

### Testing Value Objects

Test validation logic:

```typescript
describe('Email', () => {
  it('creates valid email', () => {
    const email = new Email('user@example.com');
    expect(email.value).toBe('user@example.com');
  });

  it('normalizes email', () => {
    const email = new Email('  USER@EXAMPLE.COM  ');
    expect(email.value).toBe('user@example.com');
  });

  it('throws on invalid format', () => {
    expect(() => new Email('invalid')).toThrow('Invalid email format');

    expect(() => new Email('')).toThrow('Email is required');
  });

  it('gets domain', () => {
    const email = new Email('user@example.com');
    expect(email.getDomain()).toBe('example.com');
  });
});

describe('Password', () => {
  it('validates minimum length', () => {
    expect(() => new Password('short')).toThrow('Password must be at least 8 characters');
  });

  it('validates maximum length', () => {
    const long = 'a'.repeat(129);
    expect(() => new Password(long)).toThrow('Password must be at most 128 characters');
  });

  it('hashes password', async () => {
    const password = new Password('password123');
    const hashed = await password.hash();

    expect(hashed).toBeTruthy();
    expect(hashed).not.toBe('password123');
    expect(hashed.length).toBeGreaterThan(50);
  });

  it('verifies password', async () => {
    const password = new Password('password123');
    const hashed = await password.hash();

    expect(await password.verify(hashed)).toBe(true);

    const wrong = new Password('wrong');
    expect(await wrong.verify(hashed)).toBe(false);
  });
});
```

### Testing Guards

```typescript
describe('ensureDeckOwnership', () => {
  it('allows owner', () => {
    const deck = { userId: 'user_1' } as Deck;

    expect(() => {
      ensureDeckOwnership(deck, 'user_1' as UserId);
    }).not.toThrow();
  });

  it('throws for non-owner', () => {
    const deck = { userId: 'user_1' } as Deck;

    expect(() => {
      ensureDeckOwnership(deck, 'user_2' as UserId);
    }).toThrow('You do not own this deck');
  });
});

describe('ensureValidDeckSize', () => {
  it('allows valid deck', () => {
    const cards = Array(30).fill({ cardId: 'card_1', quantity: 1 });

    expect(() => {
      ensureValidDeckSize(cards);
    }).not.toThrow();
  });

  it('throws when too small', () => {
    const cards = Array(20).fill({ cardId: 'card_1', quantity: 1 });

    expect(() => {
      ensureValidDeckSize(cards);
    }).toThrow('Deck must have at least 30 cards');
  });

  it('throws when too large', () => {
    const cards = Array(50).fill({ cardId: 'card_1', quantity: 1 });

    expect(() => {
      ensureValidDeckSize(cards);
    }).toThrow('Deck cannot have more than 40 cards');
  });
});
```

### Testing Mappers

```typescript
describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(() => {
    mapper = new UserMapper({});
  });

  it('maps user to DTO', () => {
    const user: User = {
      _id: 'user_123' as UserId,
      username: 'testuser',
      email: 'test@example.com',
      hashedPassword: 'hashed',
      createdAt: 1000,
      _creationTime: 1000
    };

    const dto = mapper.toDto(user);

    expect(dto).toEqual({
      id: 'user_123',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: 1000
    });
  });

  it('does not expose password', () => {
    const user: User = {
      _id: 'user_123' as UserId,
      username: 'testuser',
      email: 'test@example.com',
      hashedPassword: 'hashed',
      createdAt: 1000,
      _creationTime: 1000
    };

    const dto = mapper.toDto(user);

    expect(dto).not.toHaveProperty('hashedPassword');
  });

  it('maps to public DTO', () => {
    const user: User = {
      _id: 'user_123' as UserId,
      username: 'testuser',
      email: 'test@example.com',
      hashedPassword: 'hashed',
      createdAt: 1000,
      _creationTime: 1000
    };

    const dto = mapper.toPublicDto(user);

    expect(dto).not.toHaveProperty('email');
    expect(dto).toHaveProperty('username');
  });
});
```

## Integration Testing

### Testing with Convex

Use Convex's testing utilities:

```typescript
import { convexTest } from 'convex-test';
import schema from './convex/schema';
import { api } from './convex/_generated/api';

describe('Deck Integration', () => {
  it('creates and retrieves deck', async () => {
    const t = convexTest(schema);

    // Create user
    const { sessionId } = await t.mutation(api.auth.register, {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser'
    });

    // Create deck
    const { deckId } = await t.mutation(api.decks.create, {
      sessionId,
      name: 'Test Deck',
      cards: []
    });

    // Retrieve decks
    const decks = await t.query(api.decks.list, { sessionId });

    expect(decks).toHaveLength(1);
    expect(decks[0].id).toBe(deckId);
    expect(decks[0].name).toBe('Test Deck');
  });
});
```

### Testing Event Flows

```typescript
describe('AccountCreated Flow', () => {
  it('grants starter deck on registration', async () => {
    const mockScheduler = {
      runAfter: jest.fn()
    };

    const eventEmitter = new TypedEventEmitter();

    // Set up subscriber
    new DeckSubscribers({
      eventEmitter,
      scheduler: mockScheduler as any
    });

    // Emit event
    await eventEmitter.emit(
      AccountCreatedEvent.EVENT_NAME,
      new AccountCreatedEvent('user_123' as UserId)
    );

    // Verify scheduler was called
    expect(mockScheduler.runAfter).toHaveBeenCalledWith(0, expect.any(Function), {
      userId: 'user_123',
      deckTemplate: 'starter'
    });
  });
});
```

## Test Utilities

### Factory Functions

Create test data easily:

```typescript
// test-utils.ts
export function createMockUser(overrides?: Partial<User>): User {
  return {
    _id: 'user_123' as UserId,
    username: 'testuser',
    email: 'test@example.com',
    hashedPassword: 'hashed',
    createdAt: Date.now(),
    _creationTime: Date.now(),
    ...overrides
  };
}

export function createMockDeck(overrides?: Partial<Deck>): Deck {
  return {
    _id: 'deck_123' as DeckId,
    userId: 'user_123' as UserId,
    name: 'Test Deck',
    cards: [],
    isValid: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    _creationTime: Date.now(),
    ...overrides
  };
}

export function createMockSession(overrides?: Partial<AuthSession>): AuthSession {
  return {
    _id: 'session_123' as SessionId,
    userId: 'user_123' as UserId,
    expirationTime: Date.now() + 1000000,
    lastVerifiedTime: Date.now(),
    _creationTime: Date.now(),
    ...overrides
  };
}

// Usage
const user = createMockUser({ username: 'customuser' });
const deck = createMockDeck({ name: 'Custom Deck' });
```

### Mock Builders

Build complex mocks fluently:

```typescript
class MockDeckBuilder {
  private deck: Partial<Deck> = {
    _id: 'deck_123' as DeckId,
    cards: []
  };

  withName(name: string): this {
    this.deck.name = name;
    return this;
  }

  withOwner(userId: UserId): this {
    this.deck.userId = userId;
    return this;
  }

  withCards(cards: DeckCard[]): this {
    this.deck.cards = cards;
    return this;
  }

  build(): Deck {
    return this.deck as Deck;
  }
}

// Usage
const deck = new MockDeckBuilder()
  .withName('Fire Deck')
  .withOwner('user_123' as UserId)
  .withCards([{ cardId: 'card_1', quantity: 3 }])
  .build();
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✓ Good - tests behavior
it('creates a deck', async () => {
  const result = await useCase.execute({ name: 'Test' });
  expect(result).toBeTruthy();
});

// ✗ Bad - tests implementation
it('calls repository.create', async () => {
  await useCase.execute({ name: 'Test' });
  expect(mockRepo.create).toHaveBeenCalled();
});
```

### 2. Use Descriptive Test Names

```typescript
// ✓ Good
it('throws when user does not own all cards in deck', async () => {});
it('grants starter deck when user registers', async () => {});

// ✗ Bad
it('test1', async () => {});
it('works', async () => {});
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('updates deck name', async () => {
  // Arrange
  const deck = createMockDeck();
  mockRepo.getById.mockResolvedValue(deck);

  // Act
  await useCase.execute({ deckId: deck._id, name: 'New Name' });

  // Assert
  expect(mockRepo.update).toHaveBeenCalledWith(deck._id, { name: 'New Name' });
});
```

### 4. Test Edge Cases

```typescript
describe('CreateDeckUseCase', () => {
  it('creates valid deck', async () => {});
  it('throws when not authenticated', async () => {});
  it('throws when deck too small', async () => {});
  it('throws when deck too large', async () => {});
  it('throws when duplicate cards exceed limit', async () => {});
  it('throws when user does not own cards', async () => {});
  it('throws when user has too many decks', async () => {});
});
```

### 5. Keep Tests Isolated

```typescript
// ✓ Good - independent tests
describe('DeckRepository', () => {
  let repo: DeckRepository;

  beforeEach(() => {
    repo = new DeckRepository({ db: mockDb });
  });

  it('test 1', () => {});
  it('test 2', () => {});
});

// ✗ Bad - tests depend on each other
describe('DeckRepository', () => {
  let deck: Deck;

  it('creates deck', async () => {
    deck = await repo.create({});
  });

  it('updates deck', async () => {
    await repo.update(deck._id, {}); // Depends on previous test!
  });
});
```

## Running Tests

### Jest Configuration

```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/_generated/**'
  ]
};
```

### Package Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Next Steps

- Learn about [Use Case Pattern](./03-use-case-pattern.md)
- Understand [Repository Pattern](./04-repository-pattern.md)
- See [Common Tasks](./15-common-tasks.md) for TDD workflows
