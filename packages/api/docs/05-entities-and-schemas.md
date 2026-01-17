# Entities and Schemas

## Overview

Entities are TypeScript types representing domain objects. Schemas define database tables in Convex with validation and indexes.

## Entity Types

### Basic Entity Definition

```typescript
// entities/user.entity.ts
import type { Doc } from '../../_generated/dataModel';

export type User = Doc<'users'>;

export type UserId = User['_id'];
```

Benefits:

- Type-safe database access
- Auto-completion support
- Compile-time checks

### Complex Entity Types

```typescript
// entities/game.entity.ts
import type { Doc } from '../../_generated/dataModel';
import type { UserId } from '../../users/entities/user.entity';
import type { DeckId } from '../../deck/entities/deck.entity';

export type Game = Doc<'games'>;

export type GameId = Game['_id'];

export interface GamePlayer {
  userId: UserId;
  deckId: DeckId;
  position: number;
}

export interface GameResult {
  winnerId: UserId;
  loserId: UserId;
  endReason: 'normal' | 'forfeit' | 'timeout';
}
```

### Branded ID Types

IDs are branded types for type safety:

```typescript
// Can't accidentally mix up IDs
function getGame(gameId: GameId) {}
function getDeck(deckId: DeckId) {}

const gameId: GameId = 'game_123' as GameId;
const deckId: DeckId = 'deck_456' as DeckId;

getGame(gameId); // ✓ OK
getGame(deckId); // ✗ Type error!
```

## Schema Definitions

### Basic Schema

```typescript
// user.schemas.ts
import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const userSchemas = {
  users: defineTable({
    email: v.string(),
    username: v.string(),
    hashedPassword: v.string(),
    createdAt: v.number()
  })
    .index('email', ['email'])
    .index('username', ['username'])
};
```

### Schema with Relationships

```typescript
// game.schemas.ts
export const gameSchemas = {
  games: defineTable({
    status: v.string(),
    winnerId: v.optional(v.id('users')),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    isRanked: v.boolean()
  })
    .index('status', ['status'])
    .index('startedAt', ['startedAt']),

  gamePlayers: defineTable({
    gameId: v.id('games'),
    userId: v.id('users'),
    deckId: v.id('decks'),
    result: v.optional(v.union(v.literal('win'), v.literal('loss'), v.literal('draw')))
  })
    .index('gameId', ['gameId'])
    .index('userId', ['userId'])
    .index('gameId_userId', ['gameId', 'userId'])
};
```

### Schema Composition

```typescript
// schema.ts
import { defineSchema } from 'convex/server';
import { authSchemas } from './auth/auth.schema';
import { userSchemas } from './users/user.schemas';
import { gameSchemas } from './game/game.schemas';
import { deckSchemas } from './deck/deck.schemas';

export default defineSchema({
  ...authSchemas,
  ...userSchemas,
  ...gameSchemas,
  ...deckSchemas
});
```

## Real-World Examples

### Example 1: Auth Schema

```typescript
// auth/auth.schema.ts
import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const authSchemas = {
  authSessions: defineTable({
    userId: v.id('users'),
    expirationTime: v.number(),
    lastVerifiedTime: v.number()
  })
    .index('userId', ['userId'])
    .index('expirationTime', ['expirationTime']),

  passwordResetTokens: defineTable({
    userId: v.id('users'),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean()
  })
    .index('token', ['token'])
    .index('userId', ['userId'])
};
```

```typescript
// auth/entities/session.entity.ts
import type { Doc } from '../../_generated/dataModel';

export type AuthSession = Doc<'authSessions'>;

export type SessionId = AuthSession['_id'];
```

### Example 2: Deck Schema

```typescript
// deck/deck.schemas.ts
export const deckSchemas = {
  decks: defineTable({
    userId: v.id('users'),
    name: v.string(),
    cards: v.array(
      v.object({
        cardId: v.string(),
        quantity: v.number()
      })
    ),
    isValid: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('userId', ['userId'])
    .index('userId_isValid', ['userId', 'isValid'])
};
```

```typescript
// deck/entities/deck.entity.ts
import type { Doc } from '../../_generated/dataModel';

export type Deck = Doc<'decks'>;

export type DeckId = Deck['_id'];

export interface DeckCard {
  cardId: string;
  quantity: number;
}
```

### Example 3: Lobby Schema

```typescript
// lobby/lobby.schemas.ts
export const lobbySchemas = {
  lobbies: defineTable({
    creatorId: v.id('users'),
    name: v.string(),
    status: v.string(),
    maxPlayers: v.number(),
    gameId: v.optional(v.id('games')),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('creatorId', ['creatorId'])
    .index('status', ['status'])
    .index('createdAt', ['createdAt']),

  lobbyPlayers: defineTable({
    lobbyId: v.id('lobbies'),
    userId: v.id('users'),
    deckId: v.id('decks'),
    role: v.string(),
    joinedAt: v.number()
  })
    .index('lobbyId', ['lobbyId'])
    .index('userId', ['userId'])
    .index('lobbyId_userId', ['lobbyId', 'userId'])
};
```

## Index Strategies

### Single Column Index

```typescript
defineTable({
  userId: v.id('users'),
  status: v.string(),
  createdAt: v.number()
})
  .index('userId', ['userId']) // Find by user
  .index('status', ['status']) // Find by status
  .index('createdAt', ['createdAt']); // Sort by creation
```

### Composite Index

```typescript
defineTable({
  userId: v.id('users'),
  status: v.string(),
  priority: v.number()
})
  // Find by user AND status
  .index('userId_status', ['userId', 'status'])
  // Find by status, ordered by priority
  .index('status_priority', ['status', 'priority']);
```

Usage:

```typescript
// Uses composite index efficiently
const userActiveGames = await db
  .query('games')
  .withIndex('userId_status', q => q.eq('userId', userId).eq('status', 'active'))
  .collect();

// Uses index for sorting
const highPriorityActive = await db
  .query('games')
  .withIndex('status_priority', q => q.eq('status', 'active'))
  .order('desc')
  .take(10);
```

### Search Index

For text search (Convex feature):

```typescript
defineTable({
  name: v.string(),
  description: v.string()
})
  .searchIndex('search_name', {
    searchField: 'name'
  })
  .searchIndex('search_description', {
    searchField: 'description'
  });
```

## Value Object Schemas

### Enum-like Values

```typescript
// game.constants.ts
export const GAME_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  FINISHED: 'finished',
  CANCELLED: 'cancelled'
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

// Schema
defineTable({
  status: v.union(
    v.literal('pending'),
    v.literal('active'),
    v.literal('finished'),
    v.literal('cancelled')
  )
});
```

### Optional vs Required

```typescript
defineTable({
  // Required fields
  name: v.string(),
  createdAt: v.number(),

  // Optional fields
  description: v.optional(v.string()),
  finishedAt: v.optional(v.number()),

  // Nullable vs optional
  winnerId: v.optional(v.id('users')), // Field may not exist
  notes: v.union(v.string(), v.null()) // Field exists but may be null
});
```

### Arrays and Nested Objects

```typescript
defineTable({
  // Array of primitives
  tags: v.array(v.string()),

  // Array of objects
  players: v.array(
    v.object({
      userId: v.id('users'),
      score: v.number()
    })
  ),

  // Nested object
  metadata: v.object({
    version: v.string(),
    source: v.string()
  })
});
```

## Data Validation

### At the Schema Level

```typescript
defineTable({
  email: v.string(), // Must be string
  age: v.number(), // Must be number
  isActive: v.boolean() // Must be boolean
});
```

### At the Application Level

Use value objects for validation:

```typescript
// Value object with validation
export class Email {
  constructor(readonly value: string) {
    if (!value.includes('@')) {
      throw new AppError('Invalid email format');
    }
  }
}

// In repository
async create(data: { email: Email }) {
  await this.ctx.db.insert('users', {
    email: data.email.value  // Already validated
  });
}
```

## Common Patterns

### Timestamps

```typescript
defineTable({
  // Creation timestamp
  createdAt: v.number(),

  // Last update timestamp
  updatedAt: v.number(),

  // Optional deletion timestamp (soft delete)
  deletedAt: v.optional(v.number())
});
```

```typescript
// In repository
async create(data: CreateData): Promise<Id> {
  const now = Date.now();
  return this.ctx.db.insert('items', {
    ...data,
    createdAt: now,
    updatedAt: now
  });
}

async update(id: Id, data: UpdateData): Promise<void> {
  await this.ctx.db.patch(id, {
    ...data,
    updatedAt: Date.now()
  });
}
```

### Status Tracking

```typescript
defineTable({
  status: v.string(),
  statusChangedAt: v.number(),
  statusHistory: v.array(
    v.object({
      status: v.string(),
      timestamp: v.number(),
      reason: v.optional(v.string())
    })
  )
});
```

### Soft Deletes

```typescript
defineTable({
  isDeleted: v.boolean(),
  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.id('users'))
}).index('isDeleted', ['isDeleted']);
```

## Migration Strategies

### Adding Optional Fields

Safe - no migration needed:

```typescript
// Before
defineTable({
  name: v.string()
});

// After - existing records get undefined
defineTable({
  name: v.string(),
  description: v.optional(v.string())
});
```

### Adding Required Fields

Requires data migration:

```typescript
// Use optional first
defineTable({
  name: v.string(),
  category: v.optional(v.string()) // Add as optional
});

// Migrate data to fill in values
// Then change to required if needed
```

### Renaming Fields

Requires multi-step migration:

```typescript
// Step 1: Add new field as optional
defineTable({
  oldName: v.string(),
  newName: v.optional(v.string())
});

// Step 2: Copy data from oldName to newName

// Step 3: Remove oldName
defineTable({
  newName: v.string()
});
```

## Best Practices

### 1. Use Branded Types

```typescript
export type UserId = User['_id'];
// Not: export type UserId = string;
```

### 2. Define Indexes for Queries

```typescript
// If you query by userId, add an index
.index('userId', ['userId'])
```

### 3. Keep Schemas Simple

```typescript
// Good: Flat structure
defineTable({
  userId: v.id('users'),
  score: v.number()
});

// Avoid: Deep nesting
defineTable({
  user: v.object({
    profile: v.object({
      stats: v.object({
        score: v.number()
      })
    })
  })
});
```

### 4. Use Separate Tables for Relations

```typescript
// Good: Separate join table
games: defineTable({ /* ... */ }),
gamePlayers: defineTable({
  gameId: v.id('games'),
  userId: v.id('users')
})

// Avoid: Arrays of IDs (hard to query)
games: defineTable({
  playerIds: v.array(v.id('users'))
})
```

## Next Steps

- Learn about [Repository Pattern](./04-repository-pattern.md)
- Understand [Value Objects](./10-value-objects.md)
- See [Common Tasks](./15-common-tasks.md) for adding new entities
