# Convex Integration Guide

This guide covers Convex-specific patterns and conventions used in the API.

## Table of Contents

1. [Convex Overview](#convex-overview)
2. [Schema Definitions](#schema-definitions)
3. [Indexes and Queries](#indexes-and-queries)
4. [Query Wrappers](#query-wrappers)
5. [Internal Functions](#internal-functions)
6. [Scheduler](#scheduler)
7. [Database Operations](#database-operations)
8. [File Storage](#file-storage)
9. [Environment Variables](#environment-variables)
10. [Deployment](#deployment)

---

## Convex Overview

Convex is a backend-as-a-service that provides:

- **Real-time database** with subscriptions
- **Serverless functions** (queries, mutations, actions)
- **Scheduled jobs** for background tasks
- **File storage** for uploads
- **Full TypeScript support** with type inference

### Key Concepts

**Queries**: Read-only operations that can be subscribed to

```typescript
const messages = useQuery(api.messages.list);
// Automatically updates when data changes
```

**Mutations**: Write operations that modify the database

```typescript
const sendMessage = useMutation(api.messages.send);
await sendMessage({ text: 'Hello!' });
```

**Actions**: Can call external APIs, but can't directly access database

```typescript
const sendEmail = useAction(api.emails.send);
await sendEmail({ to: 'user@example.com' });
```

---

## Schema Definitions

### Defining Schemas

Schemas are defined per-module and merged in the root schema:

```typescript
// deck/deck.schemas.ts
import { defineTable } from 'convex/server';
import { v } from 'convex/values';

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
    .index('userId_createdAt', ['userId', 'createdAt'])
};
```

### Schema Composition

```typescript
// convex/schema.ts
import { defineSchema } from 'convex/server';
import { authSchemas } from './auth/auth.schemas';
import { userSchemas } from './users/user.schemas';
import { deckSchemas } from './deck/deck.schemas';
// ... more imports

export default defineSchema({
  ...authSchemas,
  ...userSchemas,
  ...deckSchemas
  // ... more schemas
});
```

### Field Types

```typescript
// Primitives
v.string();
v.number();
v.boolean();
v.null();

// Complex types
v.id('tableName'); // Foreign key
v.array(v.string()); // Array
v.optional(v.string()); // Nullable field
v.union(v.string(), v.number()); // Union type

// Objects
v.object({
  name: v.string(),
  age: v.number()
});

// Branded ID types (recommended)
v.id('users') as UserId;
```

---

## Indexes and Queries

### Creating Indexes

**Single Field Index**

```typescript
defineTable({
  userId: v.id('users'),
  createdAt: v.number()
}).index('userId', ['userId']);
```

**Compound Index**

```typescript
defineTable({
  userId: v.id('users'),
  status: v.string(),
  createdAt: v.number()
})
  .index('userId_status', ['userId', 'status'])
  .index('userId_createdAt', ['userId', 'createdAt']);
```

### Using Indexes

**Query by Index**

```typescript
// Single field
const decks = await db
  .query('decks')
  .withIndex('userId', q => q.eq('userId', userId))
  .collect();

// Compound index - exact match
const activeGames = await db
  .query('games')
  .withIndex('userId_status', q => q.eq('userId', userId).eq('status', 'active'))
  .collect();

// Compound index - range
const recentDecks = await db
  .query('decks')
  .withIndex('userId_createdAt', q =>
    q.eq('userId', userId).gte('createdAt', Date.now() - 7 * 24 * 60 * 60 * 1000)
  )
  .order('desc')
  .take(10);
```

### Query Patterns

**Filtering**

```typescript
// Get all, then filter
const validDecks = await db
  .query('decks')
  .withIndex('userId', q => q.eq('userId', userId))
  .filter(deck => deck.isValid === true)
  .collect();
```

**Pagination**

```typescript
// Using cursor
const results = await db
  .query('decks')
  .withIndex('userId', q => q.eq('userId', userId))
  .paginate({ cursor, numItems: 20 });

return {
  decks: results.page,
  continueCursor: results.continueCursor,
  isDone: results.isDone
};
```

**Ordering**

```typescript
// Descending order
const recentGames = await db
  .query('games')
  .withIndex('userId_createdAt', q => q.eq('userId', userId))
  .order('desc')
  .take(10);
```

---

## Query Wrappers

### Container Wrappers

**Query with Container**

```typescript
import { queryWithContainer } from './shared/container';

export const list = queryWithContainer({
  args: { sessionId: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<ListDecksUseCase>(ListDecksUseCase.INJECTION_KEY);
    return useCase.execute(args);
  }
});
```

**Mutation with Container**

```typescript
import { mutationWithContainer } from './shared/container';

export const create = mutationWithContainer({
  args: {
    sessionId: v.string(),
    name: v.string()
  },
  handler: async (container, args) => {
    const useCase = container.resolve<CreateDeckUseCase>(CreateDeckUseCase.INJECTION_KEY);
    return useCase.execute(args);
  }
});
```

### Session Wrappers

For endpoints that require authentication:

```typescript
import { queryWithSession } from './shared/session';

export const getCurrentUser = queryWithSession({
  args: {},
  handler: async (session, db, args) => {
    // session is guaranteed to be non-null
    const user = await db.get(session.userId);
    return user;
  }
});
```

### Internal Functions

For scheduled jobs and internal-only operations:

```typescript
import { internalMutationWithContainer } from './shared/container';

export const cleanupExpiredSessions = internalMutationWithContainer({
  args: {},
  handler: async (container, args) => {
    const useCase = container.resolve<CleanupSessionsUseCase>(
      CleanupSessionsUseCase.INJECTION_KEY
    );
    return useCase.execute();
  }
});
```

---

## Internal Functions

### Defining Internal Functions

Internal functions can only be called from:

- The scheduler
- Other internal functions
- Actions
- Background jobs

```typescript
// emails.ts
import { internal } from './_generated/api';

export const sendWelcomeEmail = internalMutationWithContainer({
  args: { userId: v.id('users') },
  handler: async (container, args) => {
    const useCase = container.resolve<SendWelcomeEmailUseCase>(
      SendWelcomeEmailUseCase.INJECTION_KEY
    );
    await useCase.execute({ userId: args.userId });
    return { success: true };
  }
});
```

### Calling from Scheduler

```typescript
import { internal } from './_generated/api';

export class UserSubscribers {
  constructor(
    private ctx: {
      scheduler: Scheduler;
      eventEmitter: EventEmitter;
    }
  ) {
    this.ctx.eventEmitter.on(
      UserRegisteredEvent.EVENT_NAME,
      this.onUserRegistered.bind(this)
    );
  }

  private async onUserRegistered(event: UserRegisteredEvent): Promise<void> {
    // Schedule welcome email
    await this.ctx.scheduler.runAfter(
      0, // immediate
      internal.emails.sendWelcomeEmail,
      { userId: event.userId }
    );
  }
}
```

---

## Scheduler

### Scheduling Jobs

**Run After Delay**

```typescript
// Run in 1 hour
await scheduler.runAfter(60 * 60 * 1000, internal.maintenance.cleanup, {
  taskId: 'cleanup_123'
});
```

**Run At Specific Time**

```typescript
// Run at midnight UTC
const midnight = new Date();
midnight.setUTCHours(24, 0, 0, 0);

await scheduler.runAt(midnight.getTime(), internal.reports.generate, {
  reportType: 'daily'
});
```

**Recurring Jobs** (via cron)

Create a cron.ts file:

```typescript
// convex/cron.ts
import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Daily at midnight
crons.interval(
  'cleanup-sessions',
  { hours: 24 },
  internal.maintenance.cleanupExpiredSessions
);

// Every 5 minutes
crons.interval('match-players', { minutes: 5 }, internal.matchmaking.processQueue);

export default crons;
```

### Scheduler in Use Cases

```typescript
export class CreateGameUseCase {
  constructor(
    protected ctx: {
      gameRepo: GameRepository;
      scheduler: Scheduler;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: CreateGameInput): Promise<GameId> {
    const gameId = await this.ctx.gameRepo.create({
      ...input,
      status: 'waiting'
    });

    // Auto-cancel if not started in 5 minutes
    await this.ctx.scheduler.runAfter(5 * 60 * 1000, internal.games.cancelIfNotStarted, {
      gameId
    });

    return gameId;
  }
}
```

---

## Database Operations

### CRUD Operations

**Create**

```typescript
const deckId = await db.insert('decks', {
  userId,
  name: 'My Deck',
  cards: [],
  isValid: false,
  createdAt: Date.now(),
  updatedAt: Date.now()
});
```

**Read**

```typescript
// By ID
const deck = await db.get(deckId);

// Query
const decks = await db
  .query('decks')
  .withIndex('userId', q => q.eq('userId', userId))
  .collect();
```

**Update**

```typescript
await db.patch(deckId, {
  name: 'New Name',
  updatedAt: Date.now()
});
```

**Delete**

```typescript
await db.delete(deckId);
```

### Transactions

All mutations are automatically transactions. Either all operations succeed or all fail.

```typescript
export const transferCards = mutationWithContainer({
  args: {
    fromDeckId: v.string(),
    toDeckId: v.string(),
    cardId: v.string()
  },
  handler: async (container, args) => {
    const db = container.resolve('db');

    // All or nothing
    const fromDeck = await db.get(args.fromDeckId);
    const toDeck = await db.get(args.toDeckId);

    await db.patch(args.fromDeckId, {
      cards: fromDeck.cards.filter(c => c.cardId !== args.cardId)
    });

    await db.patch(args.toDeckId, {
      cards: [...toDeck.cards, { cardId: args.cardId, quantity: 1 }]
    });

    return { success: true };
  }
});
```

### Repository Pattern

Wrap database operations in repositories:

```typescript
export class DeckRepository {
  constructor(private ctx: { db: DatabaseWriter }) {}

  async create(data: CreateDeckData): Promise<DeckId> {
    return (await this.ctx.db.insert('decks', {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })) as DeckId;
  }

  async update(id: DeckId, updates: Partial<Deck>): Promise<void> {
    await this.ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now()
    });
  }

  async delete(id: DeckId): Promise<void> {
    await this.ctx.db.delete(id);
  }
}
```

---

## File Storage

### Uploading Files

**1. Generate Upload URL**

```typescript
// files.ts
export const generateUploadUrl = mutation({
  handler: async ctx => {
    return await ctx.storage.generateUploadUrl();
  }
});
```

**2. Upload from Client**

```typescript
const generateUploadUrl = useMutation(api.files.generateUploadUrl);
const uploadFile = useMutation(api.files.save);

const handleUpload = async (file: File) => {
  // Get upload URL
  const uploadUrl = await generateUploadUrl();

  // Upload file
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: file
  });
  const { storageId } = await response.json();

  // Save metadata
  await uploadFile({
    storageId,
    filename: file.name,
    contentType: file.type
  });
};
```

**3. Save File Metadata**

```typescript
export const save = mutationWithContainer({
  args: {
    storageId: v.string(),
    filename: v.string(),
    contentType: v.string()
  },
  handler: async (container, args) => {
    const db = container.resolve('db');

    await db.insert('files', {
      storageId: args.storageId,
      filename: args.filename,
      contentType: args.contentType,
      uploadedAt: Date.now()
    });
  }
});
```

### Retrieving Files

**Get File URL**

```typescript
export const getUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  }
});
```

**Client Usage**

```typescript
const getFileUrl = useQuery(api.files.getUrl, {
  storageId: file.storageId
});

return <img src={getFileUrl} alt={file.filename} />;
```

---

## Environment Variables

### Defining Variables

In Convex dashboard or CLI:

```bash
npx convex env set API_KEY "your-secret-key"
npx convex env set STRIPE_KEY "sk_test_..."
```

### Using in Code

```typescript
// actions.ts (actions have access to process.env)
export const sendEmail = action({
  args: { to: v.string(), subject: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.SENDGRID_API_KEY;

    // Call external API
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        to: args.to,
        subject: args.subject
      })
    });
  }
});
```

### Best Practices

1. **Never commit secrets** to version control
2. **Use different values** for dev/prod environments
3. **Access in actions only** - queries/mutations can't access process.env
4. **Validate at startup** to catch missing variables early

---

## Deployment

### Development

```bash
# Start dev server
npx convex dev

# Run in watch mode
npx convex dev --watch
```

### Production

**Deploy to Production**

```bash
# Deploy to production
npx convex deploy --prod

# Set production environment variables
npx convex env set --prod API_KEY "prod-key"
```

**Via CI/CD**

```yaml
# .github/workflows/deploy.yml
- name: Deploy to Convex
  run: |
    npx convex deploy --prod
  env:
    CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
```

### Schema Migrations

Convex handles migrations automatically:

1. **Add new fields** - existing documents will have undefined values
2. **Remove fields** - data remains but won't be returned
3. **Rename fields** - requires data migration

**Data Migration Example**

```typescript
// migrations/renameField.ts
export const renameUserField = internalMutation({
  handler: async ctx => {
    const users = await ctx.db.query('users').collect();

    for (const user of users) {
      if ('oldField' in user) {
        await ctx.db.patch(user._id, {
          newField: user.oldField,
          oldField: undefined
        });
      }
    }
  }
});
```

### Monitoring

**View Logs**

```bash
npx convex logs --watch
```

**View Dashboard**

- Functions
- Database explorer
- Logs
- Performance metrics

---

## Common Patterns

### Soft Deletes

```typescript
defineTable({
  // ... fields
  deletedAt: v.optional(v.number())
}).index('active', ['deletedAt']);

// Query only active records
const activeDecks = await db
  .query('decks')
  .withIndex('active', q => q.eq('deletedAt', undefined))
  .collect();

// Soft delete
await db.patch(deckId, {
  deletedAt: Date.now()
});
```

### Audit Trails

```typescript
defineTable({
  // ... fields
  createdAt: v.number(),
  createdBy: v.id('users'),
  updatedAt: v.number(),
  updatedBy: v.id('users')
});

// Track changes
await db.patch(deckId, {
  name: newName,
  updatedAt: Date.now(),
  updatedBy: session.userId
});
```

### Counters

```typescript
// Increment counter atomically
const game = await db.get(gameId);
await db.patch(gameId, {
  turnCount: (game.turnCount ?? 0) + 1
});
```

---

## Performance Tips

1. **Use Indexes** - Always query with an index for performance
2. **Limit Results** - Use `.take(n)` or pagination instead of `.collect()`
3. **Avoid N+1 Queries** - Batch reads when possible
4. **Filter in Database** - Use indexes instead of filtering in memory
5. **Debounce Writes** - Batch updates to reduce mutation count

---

## Next Steps

- Review [Architecture Overview](./01-architecture-overview.md)
- See [Common Tasks](./15-common-tasks.md) for recipes
- Check [Testing Guide](./13-testing-guide.md) for testing strategies
