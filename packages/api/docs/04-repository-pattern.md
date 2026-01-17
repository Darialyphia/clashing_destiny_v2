# Repository Pattern

## Overview

Repositories abstract data access, providing a clean interface to query and manipulate data. They hide Convex-specific details from business logic.

## Structure

### Read Repository (Queries)

```typescript
export class DeckReadRepository {
  static INJECTION_KEY = 'deckReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getById(deckId: DeckId): Promise<Deck | null> {
    return this.ctx.db.get(deckId);
  }

  async getByUserId(userId: UserId): Promise<Deck[]> {
    return this.ctx.db
      .query('decks')
      .withIndex('userId', q => q.eq('userId', userId))
      .collect();
  }
}
```

### Write Repository (Mutations)

```typescript
export class DeckRepository {
  static INJECTION_KEY = 'deckRepo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  async create(data: CreateDeckData): Promise<DeckId> {
    return this.ctx.db.insert('decks', {
      ...data,
      createdAt: Date.now()
    });
  }

  async update(deckId: DeckId, data: Partial<Deck>): Promise<void> {
    await this.ctx.db.patch(deckId, data);
  }

  async delete(deckId: DeckId): Promise<void> {
    await this.ctx.db.delete(deckId);
  }
}
```

## Separation of Concerns

### Why Separate Read and Write?

1. **CQRS Pattern**: Separates query and command responsibilities
2. **Type Safety**: `DatabaseReader` vs `DatabaseWriter`
3. **Performance**: Read-only queries can be optimized differently
4. **Security**: Queries can't accidentally modify data

```typescript
// In query dependencies
export const queryDependencies = {
  [DeckReadRepository.INJECTION_KEY]: {
    resolver: asClass(DeckReadRepository)
  }
};

// In mutation dependencies
export const mutationDependencies = {
  [DeckRepository.INJECTION_KEY]: {
    resolver: asClass(DeckRepository)
  }
};
```

## Working with Convex

### Basic Queries

```typescript
export class UserRepository {
  async getById(userId: UserId): Promise<User | null> {
    return this.ctx.db.get(userId);
  }

  async getAll(): Promise<User[]> {
    return this.ctx.db.query('users').collect();
  }
}
```

### Using Indexes

Define indexes in schema:

```typescript
// user.schemas.ts
export const userSchemas = {
  users: defineTable({
    email: v.string(),
    username: v.string(),
    hashedPassword: v.string()
  })
    .index('email', ['email'])
    .index('username', ['username'])
};
```

Use indexes in repository:

```typescript
export class UserRepository {
  async getByEmail(email: Email): Promise<User | null> {
    return this.ctx.db
      .query('users')
      .withIndex('email', q => q.eq('email', email.value))
      .unique();
  }

  async getByUsername(username: Username): Promise<User | null> {
    return this.ctx.db
      .query('users')
      .withIndex('username', q => q.eq('username', username.value))
      .unique();
  }
}
```

### Complex Queries

```typescript
export class GameReadRepository {
  async getActiveGamesByUser(userId: UserId): Promise<Game[]> {
    const allGames = await this.ctx.db
      .query('games')
      .withIndex('status', q => q.eq('status', GAME_STATUS.ACTIVE))
      .collect();

    // Filter in memory for complex conditions
    return allGames.filter(game => game.players.some(p => p.userId === userId));
  }

  async getRecentGames(limit: number = 10): Promise<Game[]> {
    return this.ctx.db.query('games').withIndex('createdAt').order('desc').take(limit);
  }
}
```

### Pagination

```typescript
export class GameReadRepository {
  async getGamesPaginated(
    paginationOpts: PaginationOptions
  ): Promise<PaginationResult<Game>> {
    const results = await this.ctx.db
      .query('games')
      .withIndex('createdAt')
      .order('desc')
      .paginate(paginationOpts);

    return results;
  }
}
```

## Real-World Examples

### Example 1: Session Repository

```typescript
export class SessionRepository {
  static INJECTION_KEY = 'sessionRepo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  async create(userId: UserId): Promise<AuthSession> {
    const now = Date.now();
    const expirationTime = now + DEFAULT_SESSION_TOTAL_DURATION_MS;

    const sessionId = await this.ctx.db.insert('authSessions', {
      userId,
      expirationTime,
      lastVerifiedTime: now
    });

    const session = await this.ctx.db.get(sessionId);
    if (!session) {
      throw new AppError('Failed to create session');
    }

    return session;
  }

  async getById(sessionId: SessionId): Promise<AuthSession | null> {
    return this.ctx.db.get(sessionId);
  }

  async getByUserId(userId: UserId): Promise<AuthSession[]> {
    return this.ctx.db
      .query('authSessions')
      .withIndex('userId', q => q.eq('userId', userId))
      .collect();
  }

  async delete(sessionId: SessionId): Promise<void> {
    await this.ctx.db.delete(sessionId);
  }

  async deleteAllByUser(userId: UserId): Promise<void> {
    const sessions = await this.getByUserId(userId);
    await Promise.all(sessions.map(session => this.ctx.db.delete(session._id)));
  }

  async updateLastVerified(sessionId: SessionId): Promise<void> {
    await this.ctx.db.patch(sessionId, {
      lastVerifiedTime: Date.now()
    });
  }
}
```

### Example 2: Game Repository with Relations

```typescript
export class GameRepository {
  static INJECTION_KEY = 'gameRepo' as const;

  constructor(
    private ctx: {
      db: DatabaseWriter;
      gamePlayerRepo: GamePlayerRepository;
    }
  ) {}

  async create(data: CreateGameData): Promise<GameId> {
    // Create game
    const gameId = await this.ctx.db.insert('games', {
      status: data.status,
      startedAt: data.startedAt,
      isRanked: data.isRanked ?? false
    });

    // Create player records
    await Promise.all(
      data.players.map(player =>
        this.ctx.gamePlayerRepo.create({
          gameId,
          userId: player.userId,
          deckId: player.deckId
        })
      )
    );

    return gameId;
  }

  async update(gameId: GameId, data: Partial<Game>): Promise<void> {
    await this.ctx.db.patch(gameId, data);
  }

  async delete(gameId: GameId): Promise<void> {
    // Delete related records first
    const players = await this.ctx.gamePlayerRepo.getByGameId(gameId);
    await Promise.all(players.map(p => this.ctx.db.delete(p._id)));

    // Delete game
    await this.ctx.db.delete(gameId);
  }
}
```

### Example 3: Repository with Business Logic

```typescript
export class MatchmakingRepository {
  static INJECTION_KEY = 'matchmakingRepo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  async addToQueue(data: JoinQueueData): Promise<MatchmakingId> {
    // Check if already in queue
    const existing = await this.ctx.db
      .query('matchmaking')
      .withIndex('userId', q => q.eq('userId', data.userId))
      .filter(q => q.eq(q.field('status'), 'queued'))
      .unique();

    if (existing) {
      throw new AppError('Already in queue');
    }

    // Add to queue
    return this.ctx.db.insert('matchmaking', {
      userId: data.userId,
      deckId: data.deckId,
      status: 'queued',
      queuedAt: Date.now()
    });
  }

  async removeFromQueue(userId: UserId): Promise<void> {
    const entry = await this.ctx.db
      .query('matchmaking')
      .withIndex('userId', q => q.eq('userId', userId))
      .filter(q => q.eq(q.field('status'), 'queued'))
      .unique();

    if (entry) {
      await this.ctx.db.delete(entry._id);
    }
  }

  async getQueuedPlayers(limit?: number): Promise<MatchmakingEntry[]> {
    let query = this.ctx.db
      .query('matchmaking')
      .withIndex('status', q => q.eq('status', 'queued'))
      .order('asc'); // FIFO order

    if (limit) {
      return query.take(limit);
    }

    return query.collect();
  }
}
```

## Advanced Patterns

### Aggregations

```typescript
export class GameStatsRepository {
  async getUserWinRate(userId: UserId): Promise<number> {
    const games = await this.ctx.db
      .query('gamePlayers')
      .withIndex('userId', q => q.eq('userId', userId))
      .collect();

    const wins = games.filter(g => g.result === 'win').length;
    const total = games.length;

    return total > 0 ? wins / total : 0;
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const allPlayers = await this.ctx.db.query('gamePlayers').collect();

    // Group by user and calculate stats
    const statsByUser = new Map<UserId, { wins: number; total: number }>();

    for (const game of allPlayers) {
      const stats = statsByUser.get(game.userId) || { wins: 0, total: 0 };
      stats.total++;
      if (game.result === 'win') stats.wins++;
      statsByUser.set(game.userId, stats);
    }

    // Convert to array and sort
    const entries = Array.from(statsByUser.entries())
      .map(([userId, stats]) => ({
        userId,
        wins: stats.wins,
        losses: stats.total - stats.wins,
        winRate: stats.wins / stats.total
      }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, limit);

    return entries;
  }
}
```

### Batch Operations

```typescript
export class CardRepository {
  async grantCards(userId: UserId, cardIds: CardId[]): Promise<void> {
    await Promise.all(
      cardIds.map(cardId =>
        this.ctx.db.insert('cardCopies', {
          userId,
          cardId,
          acquiredAt: Date.now()
        })
      )
    );
  }

  async getUserCards(userId: UserId): Promise<CardCopy[]> {
    return this.ctx.db
      .query('cardCopies')
      .withIndex('userId', q => q.eq('userId', userId))
      .collect();
  }
}
```

### Soft Deletes

```typescript
export class DeckRepository {
  async softDelete(deckId: DeckId): Promise<void> {
    await this.ctx.db.patch(deckId, {
      deletedAt: Date.now(),
      isDeleted: true
    });
  }

  async getActiveDecks(userId: UserId): Promise<Deck[]> {
    const decks = await this.ctx.db
      .query('decks')
      .withIndex('userId', q => q.eq('userId', userId))
      .collect();

    return decks.filter(deck => !deck.isDeleted);
  }
}
```

## Testing Repositories

```typescript
describe('UserRepository', () => {
  let mockDb: MockDatabaseWriter;
  let repository: UserRepository;

  beforeEach(() => {
    mockDb = {
      insert: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      query: jest.fn()
    };

    repository = new UserRepository({ db: mockDb });
  });

  it('creates a user', async () => {
    mockDb.insert.mockResolvedValue('user_123');

    const userId = await repository.create({
      email: new Email('test@example.com'),
      username: new Username('testuser'),
      password: new Password('password123')
    });

    expect(userId).toBe('user_123');
    expect(mockDb.insert).toHaveBeenCalledWith('users', {
      email: 'test@example.com',
      username: 'testuser',
      hashedPassword: expect.any(String)
    });
  });
});
```

## Best Practices

### 1. Keep Repositories Simple

- Repository = data access only
- No business logic
- No authorization checks

```typescript
// Good: Simple data access
async getById(id: DeckId): Promise<Deck | null> {
  return this.ctx.db.get(id);
}

// Bad: Business logic in repository
async getById(id: DeckId): Promise<Deck | null> {
  const deck = await this.ctx.db.get(id);
  if (deck && deck.userId !== this.currentUserId) {
    throw new AppError('Not authorized');
  }
  return deck;
}
```

### 2. Use Typed IDs

```typescript
// Use branded types for safety
async getById(deckId: DeckId): Promise<Deck | null>

// Not just string
async getById(id: string): Promise<Deck | null>
```

### 3. Return Domain Types

```typescript
// Return entity types
async getById(id: DeckId): Promise<Deck | null>

// Not raw database documents
async getById(id: string): Promise<Doc<'decks'> | null>
```

### 4. Handle Not Found Gracefully

```typescript
async getById(id: DeckId): Promise<Deck | null> {
  return this.ctx.db.get(id); // Returns null if not found
}

// Let use case decide how to handle
const deck = await deckRepo.getById(input.deckId);
if (!deck) {
  throw new AppError('Deck not found');
}
```

### 5. Leverage Indexes

```typescript
// Define useful indexes in schema
.index('userId', ['userId'])
.index('email', ['email'])
.index('status', ['status'])
.index('createdAt', ['createdAt'])

// Use them in queries
.withIndex('userId', q => q.eq('userId', userId))
```

## Common Patterns

### Query Builder Pattern

```typescript
class GameQueryBuilder {
  private query: Query<'games'>;

  constructor(db: DatabaseReader) {
    this.query = db.query('games');
  }

  withStatus(status: GameStatus) {
    this.query = this.query.withIndex('status', q => q.eq('status', status));
    return this;
  }

  withUser(userId: UserId) {
    // Filter applied after index
    this.query = this.query.filter(q =>
      q.or(q.eq(q.field('player1Id'), userId), q.eq(q.field('player2Id'), userId))
    );
    return this;
  }

  async execute(): Promise<Game[]> {
    return this.query.collect();
  }
}
```

## Next Steps

- Learn about [Entities and Schemas](./05-entities-and-schemas.md)
- Understand [Use Case Pattern](./03-use-case-pattern.md)
- See [Common Tasks](./15-common-tasks.md) for implementation guides
