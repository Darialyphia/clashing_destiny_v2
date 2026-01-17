# Dependency Injection

## Overview

The API uses **Awilix** for dependency injection, providing:

- Constructor injection for explicit dependencies
- Automatic resolution of dependency graphs
- Separate containers for queries and mutations
- Easy testing through mocking

## Container Architecture

### Query Container (Read-Only)

Used for queries that don't modify data:

```typescript
export const createQueryContainer = (ctx: QueryCtxWithSession) => {
  const deps = {
    db: { resolver: asValue(ctx.db) },
    session: { resolver: asValue(ctx.session) },
    ...authProviders.queryDependencies,
    ...userProviders.queryDependencies,
    ...gameProviders.queryDependencies
    // ... other modules
  };

  return makeContainer(deps);
};
```

### Mutation Container (Write Operations)

Used for mutations that modify data:

```typescript
export const createMutationContainer = (ctx: MutationCtxWithSession) => {
  const deps = {
    db: { resolver: asValue(ctx.db) },
    session: { resolver: asValue(ctx.session) },
    scheduler: { resolver: asValue(ctx.scheduler) },
    eventEmitter: { resolver: asValue(eventEmitter) },
    ...authProviders.mutationDependencies,
    ...userProviders.mutationDependencies
    // ... other modules
  };

  return makeContainer(deps);
};
```

## Registration Patterns

### Provider Files

Each module has a `*.providers.ts` file that registers its dependencies:

```typescript
// auth/auth.providers.ts
import { asClass } from 'awilix';
import type { DependenciesMap } from '../shared/container';

export const queryDependencies = {
  [SessionReadRepository.INJECTION_KEY]: {
    resolver: asClass(SessionReadRepository)
  },
  [GetSessionUserUseCase.INJECTION_KEY]: {
    resolver: asClass(GetSessionUserUseCase)
  }
} as const satisfies DependenciesMap;

export const mutationDependencies = {
  [SessionRepository.INJECTION_KEY]: {
    resolver: asClass(SessionRepository)
  },
  [LoginUseCase.INJECTION_KEY]: {
    resolver: asClass(LoginUseCase)
  },
  [LogoutUseCase.INJECTION_KEY]: {
    resolver: asClass(LogoutUseCase)
  },
  [RegisterUseCase.INJECTION_KEY]: {
    resolver: asClass(RegisterUseCase)
  }
} as const;
```

### Injection Keys

Each injectable class defines a static `INJECTION_KEY`:

```typescript
export class UserRepository {
  static INJECTION_KEY = 'userRepo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  // ... methods
}

export class CreateDeckUseCase {
  static INJECTION_KEY = 'createDeckUseCase' as const;

  constructor(
    private ctx: {
      deckRepo: DeckRepository;
      userRepo: UserRepository;
    }
  ) {}

  // ... methods
}
```

## Dependency Resolution

### In API Endpoints

The custom wrappers automatically create and inject containers:

```typescript
// Queries
export const list = queryWithContainer({
  args: {},
  handler: async container => {
    // Resolve use case from container
    const useCase = container.resolve<GetDecksUseCase>(GetDecksUseCase.INJECTION_KEY);

    return useCase.execute();
  }
});

// Mutations
export const create = mutationWithContainer({
  args: { name: v.string(), cards: v.array(v.string()) },
  handler: async (container, args) => {
    const useCase = container.resolve<CreateDeckUseCase>(CreateDeckUseCase.INJECTION_KEY);

    return useCase.execute(args);
  }
});
```

### Constructor Injection

Dependencies are automatically injected based on parameter names:

```typescript
export class RegisterUseCase {
  constructor(
    protected ctx: {
      userRepo: UserRepository; // Matches 'userRepo' key
      sessionRepo: SessionRepository; // Matches 'sessionRepo' key
      deckRepo: DeckRepository; // Matches 'deckRepo' key
      eventEmitter: EventEmitter; // Matches 'eventEmitter' key
    }
  ) {}
}
```

Awilix automatically resolves these dependencies by matching the parameter names to registered keys.

## Lifetime Management

### Transient Dependencies (Default)

Most dependencies are transient - created per request:

```typescript
{
  [CreateDeckUseCase.INJECTION_KEY]: {
    resolver: asClass(CreateDeckUseCase)
  }
}
```

### Eager Dependencies

Some dependencies need to initialize on startup (e.g., event subscribers):

```typescript
{
  [DeckSubscribers.INJECTION_KEY]: {
    resolver: asClass(DeckSubscribers),
    eager: true  // Resolve immediately on container creation
  }
}
```

The container resolves eager dependencies immediately:

```typescript
const makeContainer = (deps: DependenciesMap) => {
  const container = createContainer({ injectionMode: InjectionMode.PROXY });

  // Register all dependencies
  Object.entries(deps).forEach(([key, { resolver }]) => {
    container.register(key, resolver);
  });

  // Resolve eager dependencies
  Object.entries(deps)
    .filter(([, { eager }]) => eager)
    .forEach(([key]) => container.resolve(key));

  return container;
};
```

## Practical Examples

### Example 1: Creating a New Use Case

```typescript
// 1. Define the use case with injected dependencies
export class UpdateUserProfileUseCase {
  static INJECTION_KEY = 'updateUserProfileUseCase' as const;

  constructor(
    private ctx: {
      userRepo: UserRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: { displayName: string }) {
    if (!this.ctx.session) {
      throw new AppError('Not authenticated');
    }

    await this.ctx.userRepo.update(this.ctx.session.userId, input);
  }
}

// 2. Register in providers
export const mutationDependencies = {
  [UpdateUserProfileUseCase.INJECTION_KEY]: {
    resolver: asClass(UpdateUserProfileUseCase)
  }
};

// 3. Use in endpoint
export const updateProfile = mutationWithContainer({
  args: { displayName: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<UpdateUserProfileUseCase>(
      UpdateUserProfileUseCase.INJECTION_KEY
    );
    return useCase.execute(args);
  }
});
```

### Example 2: Creating an Event Subscriber

```typescript
// 1. Define subscriber that needs to initialize eagerly
export class NotificationSubscribers {
  static INJECTION_KEY = 'notificationSubscribers' as const;

  constructor(
    private ctx: {
      eventEmitter: EventEmitter;
      scheduler: Scheduler;
    }
  ) {
    // Subscribe to events in constructor
    this.ctx.eventEmitter.on(
      AccountCreatedEvent.EVENT_NAME,
      this.onAccountCreated.bind(this)
    );
  }

  private async onAccountCreated(event: AccountCreatedEvent) {
    // Schedule welcome email
    await this.ctx.scheduler.runAfter(0, internal.emails.sendWelcome, {
      userId: event.userId
    });
  }
}

// 2. Register as eager dependency
export const mutationDependencies = {
  [NotificationSubscribers.INJECTION_KEY]: {
    resolver: asClass(NotificationSubscribers),
    eager: true // Important: Initialize on startup
  }
};
```

### Example 3: Repository with Multiple Dependencies

```typescript
export class GameRepository {
  static INJECTION_KEY = 'gameRepo' as const;

  constructor(
    private ctx: {
      db: DatabaseWriter;
      gameMapper: GameMapper;
    }
  ) {}

  async create(data: CreateGameData): Promise<GameId> {
    const mapped = this.ctx.gameMapper.toDatabase(data);
    return this.ctx.db.insert('games', mapped);
  }
}

// Register both the repository and its dependencies
export const mutationDependencies = {
  [GameMapper.INJECTION_KEY]: {
    resolver: asClass(GameMapper)
  },
  [GameRepository.INJECTION_KEY]: {
    resolver: asClass(GameRepository)
    // GameMapper will be auto-injected
  }
};
```

## Testing with Dependency Injection

### Mocking Dependencies

```typescript
import { createContainer, asValue } from 'awilix';

describe('CreateDeckUseCase', () => {
  it('creates a deck', async () => {
    // Create mock dependencies
    const mockDeckRepo = {
      create: jest.fn().mockResolvedValue('deck_123')
    };

    const mockSession = {
      userId: 'user_123'
    };

    // Create test container
    const container = createContainer();
    container.register({
      deckRepo: asValue(mockDeckRepo),
      session: asValue(mockSession)
    });

    // Resolve use case
    const useCase = container.resolve<CreateDeckUseCase>(CreateDeckUseCase.INJECTION_KEY);

    // Test
    const result = await useCase.execute({ name: 'My Deck', cards: [] });

    expect(mockDeckRepo.create).toHaveBeenCalled();
    expect(result).toBe('deck_123');
  });
});
```

## Common Patterns

### Context Object Pattern

Dependencies are grouped in a `ctx` object:

```typescript
constructor(private ctx: {
  db: DatabaseWriter;
  session: AuthSession | null;
  scheduler: Scheduler;
}) {}
```

Benefits:

- Clear what the class needs
- Easy to mock in tests
- Type-safe access

### Injection Key Convention

```typescript
static INJECTION_KEY = 'descriptiveName' as const;
```

Benefits:

- Type-safe resolution
- Prevents typos
- Auto-completion support

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module 'X'`

- **Solution**: Ensure the dependency is registered in the appropriate providers file

**Issue**: Circular dependencies

- **Solution**: Use interfaces and split dependencies, or restructure to break the cycle

**Issue**: Wrong container type

- **Solution**: Ensure queries use `queryWithContainer` and mutations use `mutationWithContainer`

## Next Steps

- Learn about [Use Case Pattern](./03-use-case-pattern.md)
- Understand [Repository Pattern](./04-repository-pattern.md)
- See [Common Tasks](./15-common-tasks.md) for step-by-step guides
