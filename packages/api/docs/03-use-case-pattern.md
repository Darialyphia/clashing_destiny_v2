# Use Case Pattern

## Overview

Use cases encapsulate business logic and orchestrate interactions between entities, repositories, and other services. Each use case represents a single user action or system operation.

## Structure

```typescript
export interface RegisterInput {
  email: Email;
  username: Username;
  password: Password;
}

export interface RegisterOutput {
  session: AuthSession;
}

export class RegisterUseCase implements UseCase<RegisterInput, RegisterOutput> {
  static INJECTION_KEY = 'registerUseCase' as const;

  constructor(
    protected ctx: {
      userRepo: UserRepository;
      sessionRepo: SessionRepository;
      deckRepo: DeckRepository;
      eventEmitter: EventEmitter;
    }
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    // 1. Validate business rules
    await this.validateEmail(input.email);

    // 2. Perform business operations
    const userId = await this.ctx.userRepo.create({
      username: input.username,
      email: input.email,
      password: input.password
    });

    // 3. Emit domain events
    await this.ctx.eventEmitter.emit(
      AccountCreatedEvent.EVENT_NAME,
      new AccountCreatedEvent(userId)
    );

    // 4. Create session
    const session = await this.ctx.sessionRepo.create(userId);

    // 5. Return result
    return { session };
  }

  private async validateEmail(email: Email) {
    const existing = await this.ctx.userRepo.getByEmail(email);
    if (existing) {
      throw new AppError('Email already in use');
    }
  }
}
```

## Key Principles

### 1. Single Responsibility

Each use case does ONE thing:

```typescript
// Good: Focused responsibility
export class CreateDeckUseCase {
  async execute(input: CreateDeckInput): Promise<DeckId> {
    // Only creates a deck
  }
}

export class UpdateDeckUseCase {
  async execute(input: UpdateDeckInput): Promise<void> {
    // Only updates a deck
  }
}

// Bad: Multiple responsibilities
export class DeckManagementUseCase {
  async createOrUpdateDeck(input: any) {
    // Does too much
  }
}
```

### 2. Explicit Dependencies

All dependencies are constructor-injected:

```typescript
export class StartGameUseCase {
  static INJECTION_KEY = 'startGameUseCase' as const;

  constructor(
    protected ctx: {
      gameRepo: GameRepository;
      deckRepo: DeckRepository;
      session: AuthSession | null;
      scheduler: Scheduler;
    }
  ) {}
}
```

### 3. Type-Safe Inputs and Outputs

Define explicit interfaces:

```typescript
export interface CreateDeckInput {
  name: string;
  cards: CardId[];
}

export interface CreateDeckOutput {
  deckId: DeckId;
}

export class CreateDeckUseCase implements UseCase<CreateDeckInput, CreateDeckOutput> {
  // ...
}
```

### 4. Business Rule Validation

Validate domain rules before performing operations:

```typescript
export class UpdateDeckUseCase {
  async execute(input: UpdateDeckInput): Promise<void> {
    // Validate ownership
    const deck = await this.ctx.deckRepo.getById(input.deckId);
    if (!deck) {
      throw new AppError('Deck not found');
    }

    if (deck.userId !== this.ctx.session?.userId) {
      throw new AppError('Not authorized to update this deck');
    }

    // Validate card count
    if (input.cards.length < DECK_MIN_SIZE) {
      throw new AppError(`Deck must have at least ${DECK_MIN_SIZE} cards`);
    }

    // Validate card ownership
    const userCards = await this.ctx.cardRepo.getUserCards(this.ctx.session.userId);
    const userCardIds = new Set(userCards.map(c => c.cardId));

    for (const cardId of input.cards) {
      if (!userCardIds.has(cardId)) {
        throw new AppError(`You don't own card ${cardId}`);
      }
    }

    // Perform update
    await this.ctx.deckRepo.update(input.deckId, {
      cards: input.cards
    });
  }
}
```

## Real-World Examples

### Example 1: Login Use Case

```typescript
export interface LoginInput {
  email: Email;
  password: Password;
}

export interface LoginOutput {
  session: AuthSession;
}

export class LoginUseCase implements UseCase<LoginInput, LoginOutput> {
  static INJECTION_KEY = 'loginUseCase' as const;

  constructor(
    protected ctx: {
      userRepo: UserRepository;
      sessionRepo: SessionRepository;
    }
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // Find user
    const user = await this.ctx.userRepo.getByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid credentials');
    }

    // Verify password
    const isValid = await input.password.verify(user.hashedPassword);
    if (!isValid) {
      throw new AppError('Invalid credentials');
    }

    // Create session
    const session = await this.ctx.sessionRepo.create(user._id);

    return { session };
  }
}
```

### Example 2: Start Game Use Case

```typescript
export interface StartGameInput {
  lobbyId: LobbyId;
}

export interface StartGameOutput {
  gameId: GameId;
}

export class StartGameUseCase implements UseCase<StartGameInput, StartGameOutput> {
  static INJECTION_KEY = 'startGameUseCase' as const;

  constructor(
    protected ctx: {
      lobbyRepo: LobbyRepository;
      gameRepo: GameRepository;
      session: AuthSession | null;
      scheduler: Scheduler;
    }
  ) {}

  async execute(input: StartGameInput): Promise<StartGameOutput> {
    ensureAuthenticated(this.ctx.session);

    // Get lobby
    const lobby = await this.ctx.lobbyRepo.getById(input.lobbyId);
    if (!lobby) {
      throw new AppError('Lobby not found');
    }

    // Check authorization
    if (lobby.creatorId !== this.ctx.session!.userId) {
      throw new AppError('Only lobby creator can start the game');
    }

    // Validate lobby state
    if (lobby.status !== LOBBY_STATUS.WAITING) {
      throw new AppError('Game already started');
    }

    if (lobby.players.length < 2) {
      throw new AppError('Need at least 2 players');
    }

    // Create game
    const gameId = await this.ctx.gameRepo.create({
      players: lobby.players.map(p => ({
        userId: p.userId,
        deckId: p.deckId
      })),
      status: GAME_STATUS.ACTIVE,
      startedAt: Date.now()
    });

    // Update lobby status
    await this.ctx.lobbyRepo.update(input.lobbyId, {
      status: LOBBY_STATUS.IN_GAME,
      gameId
    });

    return { gameId };
  }
}
```

### Example 3: Complex Use Case with Events

```typescript
export interface FinishGameInput {
  gameId: GameId;
  winnerId: UserId;
  loserId: UserId;
}

export interface FinishGameOutput {
  success: boolean;
}

export class FinishGameUseCase implements UseCase<FinishGameInput, FinishGameOutput> {
  static INJECTION_KEY = 'finishGameUseCase' as const;

  constructor(
    protected ctx: {
      gameRepo: GameRepository;
      gamePlayerRepo: GamePlayerRepository;
      eventEmitter: EventEmitter;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: FinishGameInput): Promise<FinishGameOutput> {
    ensureAuthenticated(this.ctx.session);

    // Get game
    const game = await this.ctx.gameRepo.getById(input.gameId);
    if (!game) {
      throw new AppError('Game not found');
    }

    // Validate game state
    if (game.status === GAME_STATUS.FINISHED) {
      throw new AppError('Game already finished');
    }

    // Verify player is in game
    const players = await this.ctx.gamePlayerRepo.getByGameId(input.gameId);
    const sessionPlayer = players.find(p => p.userId === this.ctx.session!.userId);

    if (!sessionPlayer) {
      throw new AppError('You are not in this game');
    }

    // Update game
    await this.ctx.gameRepo.update(input.gameId, {
      status: GAME_STATUS.FINISHED,
      winnerId: input.winnerId,
      finishedAt: Date.now()
    });

    // Update player records
    await Promise.all([
      this.ctx.gamePlayerRepo.update(input.winnerId, {
        result: 'win'
      }),
      this.ctx.gamePlayerRepo.update(input.loserId, {
        result: 'loss'
      })
    ]);

    // Emit domain event for other systems to react
    await this.ctx.eventEmitter.emit(
      GameEndedEvent.EVENT_NAME,
      new GameEndedEvent({
        gameId: input.gameId,
        winnerId: input.winnerId,
        loserId: input.loserId
      })
    );

    return { success: true };
  }
}
```

## Use Case Composition

Use cases can call other use cases for code reuse:

```typescript
export class SetupRankedGameUseCase {
  constructor(
    protected ctx: {
      startGameUseCase: StartGameUseCase;
      gameRepo: GameRepository;
    }
  ) {}

  async execute(input: SetupRankedInput): Promise<GameId> {
    // Use another use case
    const { gameId } = await this.ctx.startGameUseCase.execute({
      lobbyId: input.lobbyId
    });

    // Add ranked-specific logic
    await this.ctx.gameRepo.update(gameId, {
      isRanked: true,
      season: input.season
    });

    return gameId;
  }
}
```

## Testing Use Cases

Use cases are highly testable due to dependency injection:

```typescript
describe('LoginUseCase', () => {
  it('should create session on valid credentials', async () => {
    // Arrange
    const mockUser = {
      _id: 'user_123',
      email: 'test@example.com',
      hashedPassword: 'hashed_pw'
    };

    const mockUserRepo = {
      getByEmail: jest.fn().mockResolvedValue(mockUser)
    };

    const mockSessionRepo = {
      create: jest.fn().mockResolvedValue({ _id: 'session_123' })
    };

    const useCase = new LoginUseCase({
      userRepo: mockUserRepo,
      sessionRepo: mockSessionRepo
    });

    // Act
    const result = await useCase.execute({
      email: new Email('test@example.com'),
      password: new Password('password123')
    });

    // Assert
    expect(mockUserRepo.getByEmail).toHaveBeenCalled();
    expect(mockSessionRepo.create).toHaveBeenCalledWith('user_123');
    expect(result.session._id).toBe('session_123');
  });

  it('should throw on invalid password', async () => {
    const mockUserRepo = {
      getByEmail: jest.fn().mockResolvedValue(null)
    };

    const useCase = new LoginUseCase({
      userRepo: mockUserRepo,
      sessionRepo: {} as any
    });

    await expect(
      useCase.execute({
        email: new Email('test@example.com'),
        password: new Password('wrong')
      })
    ).rejects.toThrow('Invalid credentials');
  });
});
```

## Best Practices

### 1. Keep Use Cases Focused

- One use case = one user action
- Split complex operations into multiple use cases

### 2. Validate Early

- Check business rules before performing operations
- Throw descriptive errors

### 3. Use Domain Events

- Emit events for significant state changes
- Let other modules react independently

### 4. Make Dependencies Explicit

- Inject everything the use case needs
- Avoid hidden dependencies

### 5. Return Useful Data

- Return what the caller needs
- Don't expose internal details

### 6. Use Value Objects

- Validate inputs at the boundary
- Use type-safe value objects (Email, Password, etc.)

## Common Patterns

### Guard Clauses

```typescript
async execute(input: UpdateDeckInput): Promise<void> {
  ensureAuthenticated(this.ctx.session);

  const deck = await this.ctx.deckRepo.getById(input.deckId);
  if (!deck) {
    throw new AppError('Deck not found');
  }

  if (deck.userId !== this.ctx.session!.userId) {
    throw new AppError('Not authorized');
  }

  // Main logic here
}
```

### Transaction Pattern

```typescript
async execute(input: TransferInput): Promise<void> {
  // All operations succeed or all fail
  await this.ctx.db.transaction(async (tx) => {
    await tx.update('accounts', input.fromAccount, {
      balance: -input.amount
    });

    await tx.update('accounts', input.toAccount, {
      balance: +input.amount
    });
  });
}
```

## Next Steps

- Learn about [Repository Pattern](./04-repository-pattern.md)
- Understand [Event-Driven Architecture](./08-event-driven-architecture.md)
- See [Common Tasks](./15-common-tasks.md) for implementation guides
