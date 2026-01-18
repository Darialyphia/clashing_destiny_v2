# Common Tasks

This guide provides step-by-step instructions for common development tasks.

## Table of Contents

1. [Adding a New API Endpoint](#adding-a-new-api-endpoint)
2. [Creating a New Use Case](#creating-a-new-use-case)
3. [Adding a New Repository Method](#adding-a-new-repository-method)
4. [Creating a New Value Object](#creating-a-new-value-object)
5. [Adding Event Handling](#adding-event-handling)
6. [Creating a New Guard](#creating-a-new-guard)
7. [Adding a New Mapper](#adding-a-new-mapper)
8. [Creating a New Module](#creating-a-new-module)
9. [Adding Authentication to an Endpoint](#adding-authentication-to-an-endpoint)
10. [Scheduling Background Jobs](#scheduling-background-jobs)

---

## Adding a New API Endpoint

### Scenario

You want to add an endpoint to delete a deck.

### Steps

**1. Create the Use Case**

```typescript
// deck/usecases/deleteDeck.usecase.ts
import type { UseCase } from '../../usecase';
import type { DeckId } from '../entities/deck.entity';
import type { DeckRepository } from '../repositories/deck.repository';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import { AppError } from '../../utils/error';
import { ensureDeckOwnership } from '../deck.guards';

export interface DeleteDeckInput {
  deckId: DeckId;
}

export interface DeleteDeckOutput {
  success: boolean;
}

export class DeleteDeckUseCase implements UseCase<DeleteDeckInput, DeleteDeckOutput> {
  static INJECTION_KEY = 'deleteDeckUseCase' as const;

  constructor(
    protected ctx: {
      deckRepo: DeckRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: DeleteDeckInput): Promise<DeleteDeckOutput> {
    ensureAuthenticated(this.ctx.session);

    // Get deck
    const deck = await this.ctx.deckRepo.getById(input.deckId);
    if (!deck) {
      throw new AppError('Deck not found');
    }

    // Check ownership
    ensureDeckOwnership(deck, this.ctx.session.userId);

    // Delete deck
    await this.ctx.deckRepo.delete(input.deckId);

    return { success: true };
  }
}
```

**2. Register the Use Case**

```typescript
// deck/deck.providers.ts
import { DeleteDeckUseCase } from './usecases/deleteDeck.usecase';

export const mutationDependencies = {
  // ... existing
  [DeleteDeckUseCase.INJECTION_KEY]: {
    resolver: asClass(DeleteDeckUseCase)
  }
};
```

**3. Create the API Endpoint**

```typescript
// decks.ts
import { v } from 'convex/values';
import { mutationWithContainer } from './shared/container';
import { DeleteDeckUseCase } from './deck/usecases/deleteDeck.usecase';

export const destroy = mutationWithContainer({
  args: { deckId: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<DeleteDeckUseCase>(DeleteDeckUseCase.INJECTION_KEY);
    return useCase.execute(args);
  }
});
```

**4. Export from API**

```typescript
// src/index.ts
export { type DeckId } from './convex/deck/entities/deck.entity';
```

---

## Creating a New Use Case

### Scenario

You want to add functionality to favorite a deck.

### Steps

**1. Define Input/Output Types**

```typescript
// deck/usecases/favoriteDeck.usecase.ts
export interface FavoriteDeckInput {
  deckId: DeckId;
  isFavorite: boolean;
}

export interface FavoriteDeckOutput {
  success: boolean;
}
```

**2. Implement Use Case**

```typescript
export class FavoriteDeckUseCase
  implements UseCase<FavoriteDeckInput, FavoriteDeckOutput>
{
  static INJECTION_KEY = 'favoriteDeckUseCase' as const;

  constructor(
    protected ctx: {
      deckRepo: DeckRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: FavoriteDeckInput): Promise<FavoriteDeckOutput> {
    ensureAuthenticated(this.ctx.session);

    const deck = await this.ctx.deckRepo.getById(input.deckId);
    if (!deck) {
      throw new AppError('Deck not found');
    }

    ensureDeckOwnership(deck, this.ctx.session.userId);

    await this.ctx.deckRepo.update(input.deckId, {
      isFavorite: input.isFavorite,
      updatedAt: Date.now()
    });

    return { success: true };
  }
}
```

**3. Add Tests**

```typescript
// deck/usecases/favoriteDeck.usecase.test.ts
describe('FavoriteDeckUseCase', () => {
  let useCase: FavoriteDeckUseCase;
  let mockDeckRepo: jest.Mocked<DeckRepository>;
  let mockSession: AuthSession;

  beforeEach(() => {
    mockDeckRepo = {
      getById: jest.fn(),
      update: jest.fn()
    } as any;

    mockSession = {
      userId: 'user_123' as UserId
    } as AuthSession;

    useCase = new FavoriteDeckUseCase({
      deckRepo: mockDeckRepo,
      session: mockSession
    });
  });

  it('favorites a deck', async () => {
    const deck = { _id: 'deck_123', userId: 'user_123' } as Deck;
    mockDeckRepo.getById.mockResolvedValue(deck);

    await useCase.execute({
      deckId: 'deck_123' as DeckId,
      isFavorite: true
    });

    expect(mockDeckRepo.update).toHaveBeenCalledWith(
      'deck_123',
      expect.objectContaining({ isFavorite: true })
    );
  });

  it('throws when not owner', async () => {
    const deck = { _id: 'deck_123', userId: 'other_user' } as Deck;
    mockDeckRepo.getById.mockResolvedValue(deck);

    await expect(
      useCase.execute({
        deckId: 'deck_123' as DeckId,
        isFavorite: true
      })
    ).rejects.toThrow('You do not own this deck');
  });
});
```

**4. Register and Create Endpoint**

Follow steps 2-5 from "Adding a New API Endpoint"

---

## Adding a New Repository Method

### Scenario

You want to add a method to get favorited decks.

### Steps

**1. Add to Read Repository**

```typescript
// deck/repositories/deck.repository.ts
export class DeckReadRepository {
  static INJECTION_KEY = 'deckReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  // ... existing methods

  async getFavoritesByUserId(userId: UserId): Promise<Deck[]> {
    const decks = await this.ctx.db
      .query('decks')
      .withIndex('userId', q => q.eq('userId', userId))
      .collect();

    return decks.filter(deck => deck.isFavorite === true);
  }
}
```

**2. Update Schema (if needed)**

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
    isFavorite: v.optional(v.boolean()), // Add this field
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('userId', ['userId'])
    .index('userId_isFavorite', ['userId', 'isFavorite']) // Add index
};
```

**3. Use in Use Case**

```typescript
export class GetFavoriteDecksUseCase {
  async execute(): Promise<DeckDto[]> {
    ensureAuthenticated(this.ctx.session);

    const decks = await this.ctx.deckReadRepo.getFavoritesByUserId(
      this.ctx.session.userId
    );

    return this.ctx.deckMapper.toDtos(decks);
  }
}
```

---

## Creating a New Value Object

### Scenario

You want to create a validated CardId value object.

### Steps

**1. Create Value Object**

```typescript
// card/cardId.ts
import { AppError } from '../utils/error';

export class CardId {
  constructor(readonly value: string) {
    if (!value) {
      throw new AppError('Card ID is required');
    }

    if (!value.startsWith('card_')) {
      throw new AppError('Invalid card ID format');
    }

    // Normalize
    this.value = value.toLowerCase();
  }

  equals(other: CardId): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    try {
      new CardId(value);
      return true;
    } catch {
      return false;
    }
  }
}
```

**2. Add Tests**

```typescript
describe('CardId', () => {
  it('creates valid card ID', () => {
    const id = new CardId('card_123');
    expect(id.value).toBe('card_123');
  });

  it('normalizes to lowercase', () => {
    const id = new CardId('CARD_123');
    expect(id.value).toBe('card_123');
  });

  it('throws on invalid format', () => {
    expect(() => new CardId('invalid')).toThrow('Invalid card ID format');
  });

  it('checks equality', () => {
    const id1 = new CardId('card_123');
    const id2 = new CardId('card_123');
    const id3 = new CardId('card_456');

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
```

**3. Use in Code**

```typescript
export const addCardToDeck = mutationWithContainer({
  args: { deckId: v.string(), cardId: v.string() },
  handler: async (container, args) => {
    // Validate at boundary
    const cardId = new CardId(args.cardId);

    const useCase = container.resolve<AddCardToDeckUseCase>(
      AddCardToDeckUseCase.INJECTION_KEY
    );

    return useCase.execute({
      deckId: args.deckId,
      cardId: cardId.value
    });
  }
});
```

---

## Adding Event Handling

### Scenario

You want to send a notification when a friend request is accepted.

### Steps

**1. Define Event**

```typescript
// friend/events/friendRequestAccepted.event.ts
import type { UserId } from '../../users/entities/user.entity';

export class FriendRequestAcceptedEvent {
  static EVENT_NAME = 'friendRequestAccepted' as const;

  constructor(
    readonly data: {
      userId1: UserId;
      userId2: UserId;
    }
  ) {}
}
```

**2. Add to Event Map**

```typescript
// friend/friend.events.ts
import type { FriendRequestAcceptedEvent } from './events/friendRequestAccepted.event';

export type FriendEventMap = {
  // ... existing
  [FriendRequestAcceptedEvent.EVENT_NAME]: FriendRequestAcceptedEvent;
};
```

**3. Emit Event**

```typescript
// friend/usecases/acceptFriendRequest.usecase.ts
export class AcceptFriendRequestUseCase {
  async execute(input: AcceptFriendRequestInput): Promise<void> {
    // ... accept logic

    // Emit event
    await this.ctx.eventEmitter.emit(
      FriendRequestAcceptedEvent.EVENT_NAME,
      new FriendRequestAcceptedEvent({
        userId1: request.fromUserId,
        userId2: request.toUserId
      })
    );
  }
}
```

**4. Create Subscriber**

```typescript
// notification/notification.subscribers.ts
export class NotificationSubscribers {
  static INJECTION_KEY = 'notificationSubscribers' as const;

  constructor(
    private ctx: {
      eventEmitter: EventEmitter;
      notificationRepo: NotificationRepository;
    }
  ) {
    this.ctx.eventEmitter.on(
      FriendRequestAcceptedEvent.EVENT_NAME,
      this.onFriendRequestAccepted.bind(this)
    );
  }

  private async onFriendRequestAccepted(
    event: FriendRequestAcceptedEvent
  ): Promise<void> {
    // Send notification to both users
    await Promise.all([
      this.ctx.notificationRepo.create({
        userId: event.data.userId1,
        type: 'friend_accepted',
        message: 'Your friend request was accepted!'
      }),
      this.ctx.notificationRepo.create({
        userId: event.data.userId2,
        type: 'friend_accepted',
        message: 'You are now friends!'
      })
    ]);
  }
}
```

**5. Register Subscriber**

```typescript
// notification/notification.providers.ts
export const mutationDependencies = {
  [NotificationSubscribers.INJECTION_KEY]: {
    resolver: asClass(NotificationSubscribers),
    eager: true // Important!
  }
};
```

---

## Creating a New Guard

### Scenario

You want to ensure a user can start a lobby.

### Steps

**1. Create Guard**

```typescript
// lobby/lobby.guards.ts
import { AppError } from '../utils/error';
import type { Lobby } from './entities/lobby.entity';
import type { UserId } from '../users/entities/user.entity';
import { LOBBY_STATUS } from './lobby.constants';

export function ensureCanStartLobby(lobby: Lobby, userId: UserId): void {
  // Must be creator
  if (lobby.creatorId !== userId) {
    throw new AppError('Only the lobby creator can start the game');
  }

  // Must be in waiting state
  if (lobby.status !== LOBBY_STATUS.WAITING) {
    throw new AppError('Lobby is not in waiting state');
  }

  // Must have enough players
  if (lobby.players.length < 2) {
    throw new AppError('Need at least 2 players to start');
  }

  // Must not exceed max players
  if (lobby.players.length > lobby.maxPlayers) {
    throw new AppError('Too many players in lobby');
  }
}
```

**2. Add Tests**

```typescript
describe('ensureCanStartLobby', () => {
  const userId = 'user_123' as UserId;

  it('allows creator with valid lobby', () => {
    const lobby = {
      creatorId: userId,
      status: LOBBY_STATUS.WAITING,
      players: [{ userId: 'user_1' }, { userId: 'user_2' }],
      maxPlayers: 4
    } as Lobby;

    expect(() => ensureCanStartLobby(lobby, userId)).not.toThrow();
  });

  it('throws for non-creator', () => {
    const lobby = {
      creatorId: 'other_user' as UserId,
      status: LOBBY_STATUS.WAITING,
      players: [{ userId: 'user_1' }, { userId: 'user_2' }]
    } as Lobby;

    expect(() => ensureCanStartLobby(lobby, userId)).toThrow(
      'Only the lobby creator can start the game'
    );
  });

  it('throws when not enough players', () => {
    const lobby = {
      creatorId: userId,
      status: LOBBY_STATUS.WAITING,
      players: [{ userId: 'user_1' }]
    } as Lobby;

    expect(() => ensureCanStartLobby(lobby, userId)).toThrow(
      'Need at least 2 players to start'
    );
  });
});
```

**3. Use in Use Case**

```typescript
export class StartLobbyGameUseCase {
  async execute(input: StartLobbyGameInput): Promise<GameId> {
    ensureAuthenticated(this.ctx.session);

    const lobby = await this.ctx.lobbyRepo.getById(input.lobbyId);
    if (!lobby) {
      throw new AppError('Lobby not found');
    }

    // Use guard
    ensureCanStartLobby(lobby, this.ctx.session.userId);

    // Start game...
  }
}
```

---

## Adding a New Mapper

### Scenario

You want to create a mapper for notifications.

### Steps

**1. Define DTO**

```typescript
// notification/mappers/notification.mapper.ts
export interface NotificationDto {
  id: NotificationId;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}
```

**2. Create Mapper**

```typescript
export class NotificationMapper {
  static INJECTION_KEY = 'notificationMapper' as const;

  toDto(notification: Notification): NotificationDto {
    return {
      id: notification._id,
      type: notification.type,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt
    };
  }

  toDtos(notifications: Notification[]): NotificationDto[] {
    return notifications.map(n => this.toDto(n));
  }
}
```

**3. Register Mapper**

```typescript
// notification/notification.providers.ts
export const queryDependencies = {
  [NotificationMapper.INJECTION_KEY]: {
    resolver: asClass(NotificationMapper)
  }
};
```

**4. Use in Use Case**

```typescript
export class GetNotificationsUseCase {
  constructor(
    protected ctx: {
      notificationRepo: NotificationReadRepository;
      notificationMapper: NotificationMapper;
      session: AuthSession | null;
    }
  ) {}

  async execute(): Promise<NotificationDto[]> {
    ensureAuthenticated(this.ctx.session);

    const notifications = await this.ctx.notificationRepo.getByUserId(
      this.ctx.session.userId
    );

    return this.ctx.notificationMapper.toDtos(notifications);
  }
}
```

---

## Creating a New Module

See the detailed guide in [Module Guide - Adding a New Module](./14-module-guide.md#adding-a-new-module)

---

## Adding Authentication to an Endpoint

### Steps

**1. Use mutationWithContainer or queryWithContainer**

These automatically include session handling.

**2. Check Authentication in Use Case**

```typescript
export class UpdateProfileUseCase {
  async execute(input: UpdateProfileInput): Promise<void> {
    // Ensure user is logged in
    ensureAuthenticated(this.ctx.session);

    // Now safe to use session
    const userId = this.ctx.session.userId;

    await this.ctx.userRepo.update(userId, {
      displayName: input.displayName
    });
  }
}
```

**3. Client Passes Session ID**

```typescript
const updateProfile = useMutation(api.users.updateProfile);

await updateProfile({
  sessionId: sessionId, // From auth context
  displayName: 'New Name'
});
```

---

## Scheduling Background Jobs

### Scenario

You want to send a reminder email 24 hours after registration.

### Steps

**1. Create Internal Endpoint**

```typescript
// emails.ts
export const sendReminderEmail = internalMutationWithContainer({
  args: { userId: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<SendReminderEmailUseCase>(
      SendReminderEmailUseCase.INJECTION_KEY
    );

    await useCase.execute({ userId: args.userId });

    return { success: true };
  }
});
```

**2. Schedule in Event Subscriber**

```typescript
// user/user.subscribers.ts
export class UserSubscribers {
  constructor(
    private ctx: {
      eventEmitter: EventEmitter;
      scheduler: Scheduler;
    }
  ) {
    this.ctx.eventEmitter.on(
      AccountCreatedEvent.EVENT_NAME,
      this.onAccountCreated.bind(this)
    );
  }

  private async onAccountCreated(event: AccountCreatedEvent): Promise<void> {
    // Schedule for 24 hours later
    const delay = 24 * 60 * 60 * 1000; // 24 hours in ms

    await this.ctx.scheduler.runAfter(delay, internal.emails.sendReminderEmail, {
      userId: event.userId
    });
  }
}
```

**3. Or Schedule from Use Case**

```typescript
export class CreateOrderUseCase {
  async execute(input: CreateOrderInput): Promise<OrderId> {
    const orderId = await this.ctx.orderRepo.create(input);

    // Schedule immediate email
    await this.ctx.scheduler.runAfter(0, internal.emails.sendOrderConfirmation, {
      orderId
    });

    // Schedule follow-up for 7 days
    await this.ctx.scheduler.runAfter(
      7 * 24 * 60 * 60 * 1000,
      internal.emails.sendFollowUp,
      { orderId }
    );

    return orderId;
  }
}
```

---

## Next Steps

- Review [Module Guide](./14-module-guide.md) for module-specific details
- See [Testing Guide](./13-testing-guide.md) for testing patterns
- Check [Architecture Overview](./01-architecture-overview.md) for big picture
