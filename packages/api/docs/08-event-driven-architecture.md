# Event-Driven Architecture

## Overview

The API uses an event-driven architecture to decouple modules and enable reactive workflows. When significant state changes occur, domain events are emitted that other parts of the system can react to.

## Event Emitter

### Typed Event Emitter

```typescript
// shared/eventEmitter.ts
import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';

type EventMap = AuthEventMap &
  MatchmakingEventMap &
  FriendEventMap &
  LobbyEventMap &
  GameEventMap;

export type EventEmitter = TypedEventEmitter<EventMap>;
export const eventEmitter = new TypedEventEmitter<EventMap>('parallel');
```

Benefits:

- Type-safe event emission and subscription
- Auto-completion for event names
- Compile-time checking of event payloads

## Domain Events

### Event Structure

```typescript
// auth/events/accountCreated.event.ts
export class AccountCreatedEvent {
  static EVENT_NAME = 'accountCreated' as const;

  constructor(readonly userId: UserId) {}
}
```

### Event Type Map

```typescript
// auth/auth.events.ts
import type { AccountCreatedEvent } from './events/accountCreated.event';

export type AuthEventMap = {
  [AccountCreatedEvent.EVENT_NAME]: AccountCreatedEvent;
};
```

## Emitting Events

### In Use Cases

```typescript
export class RegisterUseCase {
  constructor(
    protected ctx: {
      userRepo: UserRepository;
      sessionRepo: SessionRepository;
      eventEmitter: EventEmitter;
    }
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    // Create user
    const userId = await this.ctx.userRepo.create({
      username: input.username,
      email: input.email,
      password: input.password
    });

    // Emit domain event
    await this.ctx.eventEmitter.emit(
      AccountCreatedEvent.EVENT_NAME,
      new AccountCreatedEvent(userId)
    );

    // Create session
    const session = await this.ctx.sessionRepo.create(userId);

    return { session };
  }
}
```

## Event Subscribers

### Subscriber Structure

```typescript
// deck/deck.subscribers.ts
export class DeckSubscribers {
  static INJECTION_KEY = 'deckSubscribers' as const;

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
    // Grant starter deck to new user
    await this.ctx.scheduler.runAfter(0, internal.decks.grantPremadeDeck, {
      userId: event.userId,
      deckTemplate: 'starter'
    });
  }
}
```

### Registering Subscribers

Subscribers must be registered as **eager** dependencies:

```typescript
// deck/deck.providers.ts
export const mutationDependencies = {
  [DeckSubscribers.INJECTION_KEY]: {
    resolver: asClass(DeckSubscribers),
    eager: true // Important: Initialize on startup
  }
};
```

The container resolves eager dependencies immediately:

```typescript
const makeContainer = (deps: DependenciesMap) => {
  const container = createContainer({
    /* ... */
  });

  // Register all dependencies
  Object.entries(deps).forEach(([key, { resolver }]) => {
    container.register(key, resolver);
  });

  // Resolve eager dependencies immediately
  Object.entries(deps)
    .filter(([, { eager }]) => eager)
    .forEach(([key]) => container.resolve(key));

  return container;
};
```

## Real-World Examples

### Example 1: Game Events

```typescript
// game/game.events.ts
export type GameEventMap = {
  [GameEndedEvent.EVENT_NAME]: GameEndedEvent;
  [GameStartedEvent.EVENT_NAME]: GameStartedEvent;
};
```

```typescript
// game/events/gameEnded.event.ts
export class GameEndedEvent {
  static EVENT_NAME = 'gameEnded' as const;

  constructor(
    readonly data: {
      gameId: GameId;
      winnerId: UserId;
      loserId: UserId;
    }
  ) {}
}
```

```typescript
// game/usecases/finishGame.usecase.ts
export class FinishGameUseCase {
  async execute(input: FinishGameInput): Promise<void> {
    // Update game state
    await this.ctx.gameRepo.update(input.gameId, {
      status: GAME_STATUS.FINISHED,
      winnerId: input.winnerId,
      finishedAt: Date.now()
    });

    // Emit event
    await this.ctx.eventEmitter.emit(
      GameEndedEvent.EVENT_NAME,
      new GameEndedEvent({
        gameId: input.gameId,
        winnerId: input.winnerId,
        loserId: input.loserId
      })
    );
  }
}
```

```typescript
// user/user.subscribers.ts
export class UserSubscribers {
  static INJECTION_KEY = 'userSubscribers' as const;

  constructor(
    private ctx: {
      eventEmitter: EventEmitter;
      userRepo: UserRepository;
    }
  ) {
    this.ctx.eventEmitter.on(GameEndedEvent.EVENT_NAME, this.onGameEnded.bind(this));
  }

  private async onGameEnded(event: GameEndedEvent) {
    // Update user stats
    await this.ctx.userRepo.incrementWins(event.data.winnerId);
    await this.ctx.userRepo.incrementLosses(event.data.loserId);
  }
}
```

### Example 2: Matchmaking Events

```typescript
// matchmaking/events/playersPaired.event.ts
export class PlayersPairedEvent {
  static EVENT_NAME = 'playersPaired' as const;

  constructor(readonly pairs: Array<[MatchmakingParticipant, MatchmakingParticipant]>) {}
}
```

```typescript
// matchmaking/usecases/matchPlayers.usecase.ts
export class MatchPlayersUseCase {
  async execute(): Promise<void> {
    // Get queued players
    const players = await this.ctx.matchmakingRepo.getQueuedPlayers();

    // Pair them up
    const pairs = this.pairPlayers(players);

    if (pairs.length === 0) return;

    // Emit event with pairs
    await this.ctx.eventEmitter.emit(
      PlayersPairedEvent.EVENT_NAME,
      new PlayersPairedEvent(pairs)
    );
  }
}
```

```typescript
// game/game.subscribers.ts
export class GameSubscribers {
  static INJECTION_KEY = 'gameSubscribers' as const;

  constructor(
    private ctx: {
      eventEmitter: EventEmitter;
      scheduler: Scheduler;
    }
  ) {
    this.ctx.eventEmitter.on(
      PlayersPairedEvent.EVENT_NAME,
      this.onPlayersPaired.bind(this)
    );
  }

  private async onPlayersPaired(event: PlayersPairedEvent) {
    // Create games for each pair
    await Promise.all(
      event.pairs.map(async ([playerA, playerB]) => {
        await this.ctx.scheduler.runAfter(0, internal.games.setupRankedGame, {
          pair: [
            {
              userId: playerA.meta.userId,
              deckId: playerA.meta.deckId
            },
            {
              userId: playerB.meta.userId,
              deckId: playerB.meta.deckId
            }
          ]
        });
      })
    );
  }
}
```

### Example 3: Friend Request Events

```typescript
// friend/friend.events.ts
export class FriendRequestSentEvent {
  static EVENT_NAME = 'friendRequestSent' as const;

  constructor(
    readonly data: {
      fromUserId: UserId;
      toUserId: UserId;
      requestId: FriendRequestId;
    }
  ) {}
}

export class FriendRequestAcceptedEvent {
  static EVENT_NAME = 'friendRequestAccepted' as const;

  constructor(
    readonly data: {
      userId1: UserId;
      userId2: UserId;
    }
  ) {}
}

export type FriendEventMap = {
  [FriendRequestSentEvent.EVENT_NAME]: FriendRequestSentEvent;
  [FriendRequestAcceptedEvent.EVENT_NAME]: FriendRequestAcceptedEvent;
};
```

```typescript
// notification/notification.subscribers.ts
export class NotificationSubscribers {
  static INJECTION_KEY = 'notificationSubscribers' as const;

  constructor(
    private ctx: {
      eventEmitter: EventEmitter;
      scheduler: Scheduler;
    }
  ) {
    this.ctx.eventEmitter.on(
      FriendRequestSentEvent.EVENT_NAME,
      this.onFriendRequestSent.bind(this)
    );

    this.ctx.eventEmitter.on(
      FriendRequestAcceptedEvent.EVENT_NAME,
      this.onFriendRequestAccepted.bind(this)
    );
  }

  private async onFriendRequestSent(event: FriendRequestSentEvent) {
    // Send notification to recipient
    await this.ctx.scheduler.runAfter(0, internal.notifications.create, {
      userId: event.data.toUserId,
      type: 'friend_request',
      data: { fromUserId: event.data.fromUserId }
    });
  }

  private async onFriendRequestAccepted(event: FriendRequestAcceptedEvent) {
    // Send notifications to both users
    await Promise.all([
      this.ctx.scheduler.runAfter(0, internal.notifications.create, {
        userId: event.data.userId1,
        type: 'friend_request_accepted',
        data: { friendId: event.data.userId2 }
      }),
      this.ctx.scheduler.runAfter(0, internal.notifications.create, {
        userId: event.data.userId2,
        type: 'friend_request_accepted',
        data: { friendId: event.data.userId1 }
      })
    ]);
  }
}
```

## Integration with Scheduler

### Scheduling Async Work

Use the scheduler for work that should happen asynchronously:

```typescript
export class OrderSubscribers {
  constructor(
    private ctx: {
      eventEmitter: EventEmitter;
      scheduler: Scheduler;
    }
  ) {
    this.ctx.eventEmitter.on(OrderPlacedEvent.EVENT_NAME, this.onOrderPlaced.bind(this));
  }

  private async onOrderPlaced(event: OrderPlacedEvent) {
    // Schedule email to send immediately
    await this.ctx.scheduler.runAfter(0, internal.emails.sendOrderConfirmation, {
      orderId: event.orderId
    });

    // Schedule reminder for 24 hours later
    await this.ctx.scheduler.runAfter(
      24 * 60 * 60 * 1000,
      internal.emails.sendOrderReminder,
      { orderId: event.orderId }
    );
  }
}
```

## Event Patterns

### Pattern 1: Saga Pattern

Coordinate complex workflows across modules:

```typescript
// When matchmaking finds players
PlayersPairedEvent
  ↓
// Game module creates game
GameCreatedEvent
  ↓
// Lobby module updates lobby status
LobbyUpdatedEvent
  ↓
// Notification module notifies players
NotificationsSentEvent
```

### Pattern 2: Event Sourcing (Light)

Track state changes as events:

```typescript
export class UserActivitySubscriber {
  constructor(
    private ctx: {
      eventEmitter: EventEmitter;
      activityRepo: ActivityRepository;
    }
  ) {
    this.ctx.eventEmitter.on(GameEndedEvent.EVENT_NAME, this.logActivity.bind(this));
  }

  private async logActivity(event: GameEndedEvent) {
    await this.ctx.activityRepo.create({
      userId: event.data.winnerId,
      type: 'game_won',
      timestamp: Date.now(),
      metadata: { gameId: event.data.gameId }
    });
  }
}
```

### Pattern 3: Fan-Out

One event triggers multiple independent actions:

```typescript
// Single event
AccountCreatedEvent
  ↓
// Multiple subscribers react independently
├─ DeckSubscribers → Grant starter deck
├─ CardSubscribers → Grant starter cards
├─ EmailSubscribers → Send welcome email
└─ AnalyticsSubscribers → Track signup
```

## Best Practices

### 1. Events Represent Past Facts

```typescript
// Good: Past tense
AccountCreatedEvent;
GameEndedEvent;
FriendRequestSentEvent;

// Bad: Commands or intents
CreateAccountEvent;
EndGameEvent;
SendFriendRequestEvent;
```

### 2. Events Are Immutable

```typescript
// Good: readonly properties
export class AccountCreatedEvent {
  constructor(readonly userId: UserId) {}
}

// Bad: Mutable state
export class AccountCreatedEvent {
  userId: UserId;
}
```

### 3. Keep Event Payloads Simple

```typescript
// Good: Only essential data
export class GameEndedEvent {
  constructor(
    readonly data: {
      gameId: GameId;
      winnerId: UserId;
      loserId: UserId;
    }
  ) {}
}

// Bad: Too much data
export class GameEndedEvent {
  constructor(
    readonly game: Game, // Entire entity
    readonly winner: User,
    readonly loser: User,
    readonly allMoves: Move[]
  ) {}
}
```

### 4. Use Scheduler for Side Effects

```typescript
// Good: Async via scheduler
await this.ctx.scheduler.runAfter(0, internal.emails.send, { userId });

// Bad: Blocking operation
await sendEmail(userId);
```

### 5. Make Subscribers Idempotent

```typescript
private async onGameEnded(event: GameEndedEvent) {
  // Check if already processed
  const existing = await this.ctx.repo.findByGameId(event.data.gameId);
  if (existing) {
    return; // Already processed
  }

  // Process event
  await this.ctx.repo.create({ /* ... */ });
}
```

## Testing Events

### Testing Event Emission

```typescript
describe('FinishGameUseCase', () => {
  it('emits GameEndedEvent', async () => {
    const mockEventEmitter = {
      emit: jest.fn()
    };

    const useCase = new FinishGameUseCase({
      gameRepo: mockGameRepo,
      eventEmitter: mockEventEmitter
    });

    await useCase.execute({ gameId, winnerId, loserId });

    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      GameEndedEvent.EVENT_NAME,
      expect.any(GameEndedEvent)
    );
  });
});
```

### Testing Subscribers

```typescript
describe('UserSubscribers', () => {
  it('updates user stats on game end', async () => {
    const mockUserRepo = {
      incrementWins: jest.fn(),
      incrementLosses: jest.fn()
    };

    const eventEmitter = new TypedEventEmitter();

    new UserSubscribers({
      eventEmitter,
      userRepo: mockUserRepo
    });

    // Emit event
    await eventEmitter.emit(
      GameEndedEvent.EVENT_NAME,
      new GameEndedEvent({
        gameId: 'game_123',
        winnerId: 'user_1',
        loserId: 'user_2'
      })
    );

    expect(mockUserRepo.incrementWins).toHaveBeenCalledWith('user_1');
    expect(mockUserRepo.incrementLosses).toHaveBeenCalledWith('user_2');
  });
});
```

## Common Pitfalls

### ❌ Forgetting to Register as Eager

```typescript
// Bad: Subscriber won't initialize
export const mutationDependencies = {
  [MySubscribers.INJECTION_KEY]: {
    resolver: asClass(MySubscribers)
    // Missing: eager: true
  }
};
```

### ❌ Subscribing Outside Constructor

```typescript
// Bad: Race condition
export class MySubscribers {
  constructor(private ctx: { eventEmitter: EventEmitter }) {}

  init() {
    // May miss events!
    this.ctx.eventEmitter.on(/*...*/);
  }
}

// Good: Subscribe in constructor
export class MySubscribers {
  constructor(private ctx: { eventEmitter: EventEmitter }) {
    this.ctx.eventEmitter.on(/*...*/);
  }
}
```

### ❌ Awaiting Scheduler in Event Handler

```typescript
// Bad: Blocks event loop
await this.ctx.scheduler.runAfter(0, internal.fn, {});

// Good: Fire and forget (scheduler handles it)
this.ctx.scheduler.runAfter(0, internal.fn, {});
```

## Next Steps

- Learn about [Dependency Injection](./02-dependency-injection.md)
- Understand [Use Case Pattern](./03-use-case-pattern.md)
- See [Common Tasks](./15-common-tasks.md) for event patterns
