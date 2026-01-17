# API Endpoints

## Overview

API endpoints are the public interface of your backend. They handle client requests, validate inputs, and orchestrate business logic through use cases.

## Endpoint Types

### Queries (Read-Only)

```typescript
export const list = queryWithContainer({
  args: {},
  handler: async container => {
    const useCase = container.resolve<GetDecksUseCase>(GetDecksUseCase.INJECTION_KEY);
    return useCase.execute();
  }
});
```

### Mutations (Write Operations)

```typescript
export const create = mutationWithContainer({
  args: {
    name: v.string(),
    cards: v.array(v.string())
  },
  handler: async (container, args) => {
    const useCase = container.resolve<CreateDeckUseCase>(CreateDeckUseCase.INJECTION_KEY);
    return useCase.execute(args);
  }
});
```

### Internal Functions

```typescript
export const setupRankedGame = internalMutationWithContainer({
  args: {
    pair: v.array(
      v.object({
        userId: v.string(),
        deckId: v.string()
      })
    )
  },
  handler: async (container, args) => {
    // Only callable by scheduler or other backend functions
    const useCase = container.resolve<SetupRankedGameUseCase>(
      SetupRankedGameUseCase.INJECTION_KEY
    );
    return useCase.execute(args);
  }
});
```

## Container Wrappers

### queryWithContainer

For read-only operations:

```typescript
import { queryWithContainer } from './shared/container';

export const me = queryWithContainer({
  args: {},
  handler: async container => {
    // Container has session attached
    const useCase = container.resolve<GetSessionUserUseCase>(
      GetSessionUserUseCase.INJECTION_KEY
    );
    return useCase.execute();
  }
});
```

### mutationWithContainer

For write operations:

```typescript
import { mutationWithContainer } from './shared/container';

export const create = mutationWithContainer({
  args: { name: v.string() },
  handler: async (container, args) => {
    // Container has session, scheduler, eventEmitter
    const useCase = container.resolve<CreateDeckUseCase>(CreateDeckUseCase.INJECTION_KEY);
    return useCase.execute(args);
  }
});
```

### internalMutationWithContainer

For internal backend operations:

```typescript
import { internalMutationWithContainer } from './shared/container';

export const internalCreate = internalMutationWithContainer({
  args: { userId: v.string(), data: v.any() },
  handler: async (container, args) => {
    // No session - called by scheduler or other functions
    const useCase = container.resolve<CreateUseCase>(CreateUseCase.INJECTION_KEY);
    return useCase.execute(args);
  }
});
```

## Argument Validation

### Convex Validators

```typescript
import { v } from 'convex/values';

export const create = mutationWithContainer({
  args: {
    // Primitive types
    name: v.string(),
    age: v.number(),
    isActive: v.boolean(),

    // Optional values
    description: v.optional(v.string()),

    // Arrays
    tags: v.array(v.string()),

    // Objects
    metadata: v.object({
      key: v.string(),
      value: v.string()
    }),

    // Unions
    status: v.union(v.literal('active'), v.literal('inactive')),

    // IDs
    userId: v.id('users'),

    // Nullable
    notes: v.union(v.string(), v.null())
  },
  handler: async (container, args) => {
    // args are validated automatically
    return { success: true };
  }
});
```

### Value Object Validation

```typescript
export const register = mutationWithContainer({
  args: {
    email: v.string(),
    password: v.string(),
    username: v.string()
  },
  handler: async (container, args) => {
    const useCase = container.resolve<RegisterUseCase>(RegisterUseCase.INJECTION_KEY);

    // Convert to value objects with validation
    const result = await useCase.execute({
      email: new Email(args.email), // Validates email format
      password: new Password(args.password), // Validates password strength
      username: new Username(args.username) // Validates username format
    });

    return { sessionId: result.session._id };
  }
});
```

## Real-World Examples

### Example 1: Auth Endpoints

```typescript
// auth.ts
import { v } from 'convex/values';
import { Email } from './utils/email';
import { Password } from './utils/password';
import { Username } from './users/username';
import { mutationWithContainer, queryWithContainer } from './shared/container';
import { ensureAuthenticated } from './auth/auth.utils';

export const register = mutationWithContainer({
  args: {
    email: v.string(),
    password: v.string(),
    username: v.string()
  },
  handler: async (container, input) => {
    const useCase = container.resolve<RegisterUseCase>(RegisterUseCase.INJECTION_KEY);

    const result = await useCase.execute({
      email: new Email(input.email),
      password: new Password(input.password),
      username: new Username(input.username)
    });

    return { sessionId: result.session._id };
  }
});

export const login = mutationWithContainer({
  args: {
    email: v.string(),
    password: v.string()
  },
  handler: async (container, input) => {
    const useCase = container.resolve<LoginUseCase>(LoginUseCase.INJECTION_KEY);

    const result = await useCase.execute({
      email: new Email(input.email),
      password: new Password(input.password)
    });

    return { sessionId: result.session._id };
  }
});

export const logout = mutationWithContainer({
  args: {},
  handler: async container => {
    const useCase = container.resolve<LogoutUseCase>(LogoutUseCase.INJECTION_KEY);

    await useCase.execute();

    return { success: true };
  }
});

export const me = queryWithContainer({
  args: {},
  handler: async container => {
    ensureAuthenticated(container.resolve('session'));

    const useCase = container.resolve<GetSessionUserUseCase>(
      GetSessionUserUseCase.INJECTION_KEY
    );

    return useCase.execute();
  }
});
```

### Example 2: Deck Management

```typescript
// decks.ts
import { v } from 'convex/values';
import {
  mutationWithContainer,
  queryWithContainer,
  internalMutationWithContainer
} from './shared/container';

export const list = queryWithContainer({
  args: {},
  handler: async container => {
    const useCase = container.resolve<GetDecksUseCase>(GetDecksUseCase.INJECTION_KEY);
    return useCase.execute();
  }
});

export const create = mutationWithContainer({
  args: {
    name: v.string(),
    cards: v.array(
      v.object({
        cardId: v.string(),
        quantity: v.number()
      })
    )
  },
  handler: async (container, args) => {
    const useCase = container.resolve<CreateDeckUseCase>(CreateDeckUseCase.INJECTION_KEY);
    return useCase.execute(args);
  }
});

export const update = mutationWithContainer({
  args: {
    deckId: v.string(),
    name: v.optional(v.string()),
    cards: v.optional(
      v.array(
        v.object({
          cardId: v.string(),
          quantity: v.number()
        })
      )
    )
  },
  handler: async (container, args) => {
    const useCase = container.resolve<UpdateDeckUseCase>(UpdateDeckUseCase.INJECTION_KEY);
    await useCase.execute(args);
    return { success: true };
  }
});

export const destroy = mutationWithContainer({
  args: { deckId: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<DeleteDeckUseCase>(DeleteDeckUseCase.INJECTION_KEY);
    await useCase.execute(args);
    return { success: true };
  }
});

// Internal endpoint for granting starter decks
export const grantPremadeDeck = internalMutationWithContainer({
  args: {
    userId: v.string(),
    deckTemplate: v.string()
  },
  handler: async (container, args) => {
    const useCase = container.resolve<GrantPremadeDeckUseCase>(
      GrantPremadeDeckUseCase.INJECTION_KEY
    );
    return useCase.execute(args);
  }
});
```

### Example 3: Game Management

```typescript
// games.ts
import { v } from 'convex/values';
import {
  internalMutationWithContainer,
  mutationWithContainer,
  queryWithContainer
} from './shared/container';

export const start = mutationWithContainer({
  args: { lobbyId: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<StartGameUseCase>(StartGameUseCase.INJECTION_KEY);

    const result = await useCase.execute(args);

    return { gameId: result.gameId };
  }
});

export const finish = mutationWithContainer({
  args: {
    gameId: v.string(),
    winnerId: v.string(),
    loserId: v.string()
  },
  handler: async (container, args) => {
    const useCase = container.resolve<FinishGameUseCase>(FinishGameUseCase.INJECTION_KEY);

    await useCase.execute(args);

    return { success: true };
  }
});

export const cancel = mutationWithContainer({
  args: { gameId: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<CancelGameUseCase>(CancelGameUseCase.INJECTION_KEY);

    await useCase.execute(args);

    return { success: true };
  }
});

export const infosById = queryWithContainer({
  args: { gameId: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<GetGameInfosUseCase>(
      GetGameInfosUseCase.INJECTION_KEY
    );

    return useCase.execute(args);
  }
});

export const latest = queryWithContainer({
  args: {
    limit: v.optional(v.number()),
    paginationOpts: v.optional(v.any())
  },
  handler: async (container, args) => {
    const useCase = container.resolve<GetLatestGamesUseCase>(
      GetLatestGamesUseCase.INJECTION_KEY
    );

    return useCase.execute({
      limit: args.limit ?? 10,
      paginationOpts: args.paginationOpts
    });
  }
});

// Internal endpoint called by scheduler
export const setupRankedGame = internalMutationWithContainer({
  args: {
    pair: v.array(
      v.object({
        userId: v.string(),
        deckId: v.string()
      })
    )
  },
  handler: async (container, args) => {
    const useCase = container.resolve<SetupRankedGameUseCase>(
      SetupRankedGameUseCase.INJECTION_KEY
    );

    const gameId = await useCase.execute({ players: args.pair });

    return { gameId };
  }
});

// Internal endpoint for cleanup
export const internalCancel = internalMutationWithContainer({
  args: { gameId: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<CancelGameUseCase>(CancelGameUseCase.INJECTION_KEY);

    await useCase.execute(args);

    return { success: true };
  }
});
```

## Session Handling

### Accessing Current User

```typescript
export const create = mutationWithContainer({
  args: { name: v.string() },
  handler: async (container, args) => {
    // Get session from container
    const session = container.resolve<AuthSession | null>('session');

    if (!session) {
      throw new AppError('Not authenticated');
    }

    // Or use helper
    ensureAuthenticated(session);

    // Now session.userId is available
    const userId = session.userId;
  }
});
```

### Optional Authentication

```typescript
export const list = queryWithContainer({
  args: {},
  handler: async container => {
    const session = container.resolve<AuthSession | null>('session');

    // Different behavior based on auth status
    if (session) {
      return getPersonalizedResults(session.userId);
    } else {
      return getPublicResults();
    }
  }
});
```

## Error Handling

### Throwing Errors

```typescript
export const create = mutationWithContainer({
  args: { name: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<CreateUseCase>(CreateUseCase.INJECTION_KEY);

    try {
      return await useCase.execute(args);
    } catch (error) {
      if (error instanceof AppError) {
        // Re-throw domain errors
        throw error;
      }

      // Log unexpected errors
      console.error('Unexpected error:', error);
      throw new AppError('Internal server error');
    }
  }
});
```

## Client Usage

### From Client Code

```typescript
// packages/client/src/game/useGames.ts
import { useMutation, useQuery } from 'convex/react';
import { api } from '@game/api';

export function useGames() {
  // Query
  const games = useQuery(api.games.latest, { limit: 10 });

  // Mutation
  const startGame = useMutation(api.games.start);

  const handleStart = async (lobbyId: string) => {
    const result = await startGame({ lobbyId });
    console.log('Game started:', result.gameId);
  };

  return { games, startGame: handleStart };
}
```

### With Session

```typescript
import { useConvex } from 'convex/react';

const convex = useConvex();

// Pass sessionId automatically
const result = await convex.mutation(api.decks.create, {
  sessionId: sessionId, // Injected by auth wrapper
  name: 'My Deck',
  cards: []
});
```

## Best Practices

### 1. Keep Handlers Thin

```typescript
// Good: Handler just orchestrates
export const create = mutationWithContainer({
  args: { name: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<CreateDeckUseCase>(
      CreateDeckUseCase.INJECTION_KEY
    );
    return useCase.execute(args);
  }
});

// Bad: Business logic in handler
export const create = mutationWithContainer({
  args: { name: v.string() },
  handler: async (container, args) => {
    const session = container.resolve('session');
    if (!session) throw new Error('Not authenticated');

    const existingDecks = await db.query('decks')...
    if (existingDecks.length >= 10) throw new Error('Too many decks');

    const deckId = await db.insert('decks', {
      userId: session.userId,
      name: args.name
    });

    // ... more logic
  }
});
```

### 2. Validate with Convex Validators

```typescript
// Good: Type-safe validation
args: {
  name: v.string(),
  age: v.number()
}

// Bad: Manual validation
args: { data: v.any() }
handler: async (container, args) => {
  if (typeof args.data.name !== 'string') { }
}
```

### 3. Use Descriptive Names

```typescript
// Good
export const create = mutationWithContainer({});
export const updateName = mutationWithContainer({});
export const listByUser = queryWithContainer({});

// Bad
export const doThing = mutationWithContainer({});
export const handler = mutationWithContainer({});
```

### 4. Return Useful Data

```typescript
// Good: Return what client needs
return {
  deckId: result.deckId,
  name: result.name
};

// Bad: Return everything or nothing
return { success: true };
```

## Testing Endpoints

```typescript
describe('decks.create', () => {
  it('creates a deck', async () => {
    const mockContainer = {
      resolve: jest.fn(key => {
        if (key === CreateDeckUseCase.INJECTION_KEY) {
          return {
            execute: jest.fn().mockResolvedValue({
              deckId: 'deck_123'
            })
          };
        }
      })
    };

    const handler = create.handler;
    const result = await handler(mockContainer as any, {
      name: 'Test Deck',
      cards: []
    });

    expect(result.deckId).toBe('deck_123');
  });
});
```

## Next Steps

- Learn about [Authentication](./07-authentication.md)
- Understand [Use Case Pattern](./03-use-case-pattern.md)
- See [Common Tasks](./15-common-tasks.md) for creating endpoints
