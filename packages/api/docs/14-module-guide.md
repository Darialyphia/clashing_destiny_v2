# Module Guide

## Overview

The API is organized into domain modules, each representing a bounded context in the application. This guide provides a deep dive into each module.

## Module Structure

Each module follows a consistent structure:

```
module-name/
├── module-name.ts              # API endpoints
├── module-name.providers.ts    # Dependency registration
├── module-name.schema.ts       # Database schemas
├── module-name.constants.ts    # Module constants
├── module-name.events.ts       # Event type definitions
├── module-name.guards.ts       # Authorization guards
├── module-name.subscribers.ts  # Event handlers
├── entities/                   # Entity type definitions
├── repositories/               # Data access layer
├── usecases/                  # Business logic
├── mappers/                   # Data transformation
└── events/                    # Event classes
```

## Auth Module

**Purpose**: User registration, login, and session management

### Key Files

- `auth.ts` - Registration, login, logout endpoints
- `auth/usecases/register.usecase.ts` - User registration logic
- `auth/usecases/login.usecase.ts` - User authentication
- `auth/repositories/session.repository.ts` - Session management
- `auth/entities/session.entity.ts` - Session type definition

### Key Concepts

```typescript
// Session-based authentication
const { sessionId } = await api.auth.register({
  email: 'user@example.com',
  password: 'password123',
  username: 'username'
});

// Include sessionId in subsequent requests
const user = await api.auth.me({ sessionId });
```

### Events

- `AccountCreatedEvent` - Emitted when user registers

### Dependencies

- Uses `@node-rs/argon2` for password hashing
- Validates email format
- Creates session after successful login

## User Module

**Purpose**: User profile management

### Key Files

- `users/entities/user.entity.ts` - User type
- `users/repositories/user.repository.ts` - User data access
- `users/username.ts` - Username validation
- `users/mappers/user.mapper.ts` - User DTO transformation

### Key Features

- Username validation (3-20 chars, alphanumeric + underscore)
- Email uniqueness check
- User profile retrieval

## Game Module

**Purpose**: Game lifecycle management

### Key Files

- `games.ts` - Game API endpoints
- `game/usecases/startGame.usecase.ts` - Game creation
- `game/usecases/finishGame.usecase.ts` - Game completion
- `game/repositories/game.repository.ts` - Game data access
- `game/game.subscribers.ts` - Handles matchmaking events

### Game Flow

```
1. Players paired (Matchmaking) → PlayersPairedEvent
2. Game created (setupRankedGame)
3. Game active (players play)
4. Game finished (finishGame) → GameEndedEvent
5. Stats updated (UserSubscribers)
```

### Game States

```typescript
export const GAME_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  FINISHED: 'finished',
  CANCELLED: 'cancelled'
} as const;
```

### Events

- `GameEndedEvent` - Game completed with winner
- `GameStartedEvent` - Game begins

### Cross-Module Interactions

- Listens to `PlayersPairedEvent` from Matchmaking
- Emits `GameEndedEvent` for User stats

## Deck Module

**Purpose**: Deck creation and management

### Key Files

- `decks.ts` - Deck API endpoints
- `deck/usecases/createDeck.usecase.ts` - Deck creation
- `deck/usecases/updateDeck.usecase.ts` - Deck updates
- `deck/repositories/deck.repository.ts` - Deck data access
- `deck/deck.subscribers.ts` - Grants starter decks

### Deck Rules

```typescript
const DECK_MIN_SIZE = 30;
const DECK_MAX_SIZE = 40;
const MAX_COPIES_PER_CARD = 3;
```

### Deck Validation

- Size between 30-40 cards
- Max 3 copies of any card
- User must own all cards
- Max 10 decks per user

### Events Handled

- `AccountCreatedEvent` - Grants starter deck to new users

## Card Module

**Purpose**: Card collection management

### Key Files

- `cards.ts` - Card API endpoints
- `card/usecases/getMyCollection.usecase.ts` - User's cards
- `card/usecases/grantMissingCards.usecase.ts` - Card grants
- `card/repositories/cardCopy.repository.ts` - Card ownership

### Key Features

- Track card ownership
- Grant cards to users
- Query user's collection

### Card Copies

Each user has separate copies of cards:

```typescript
interface CardCopy {
  userId: UserId;
  cardId: CardId;
  acquiredAt: number;
}
```

## Lobby Module

**Purpose**: Multiplayer game lobbies

### Key Files

- `lobbies.ts` - Lobby API endpoints
- `lobby/usecases/createLobby.usecase.ts` - Lobby creation
- `lobby/usecases/joinLobby.usecase.ts` - Join lobby
- `lobby/repositories/lobby.repository.ts` - Lobby data access

### Lobby States

```typescript
export const LOBBY_STATUS = {
  WAITING: 'waiting', // Accepting players
  IN_GAME: 'in_game', // Game in progress
  FINISHED: 'finished' // Game completed
} as const;
```

### Lobby Roles

```typescript
export const LOBBY_USER_ROLES = {
  CREATOR: 'creator',
  ADMIN: 'admin',
  PLAYER: 'player'
} as const;
```

### Lobby Flow

```
1. User creates lobby
2. Other users join
3. Creator starts game
4. Lobby transitions to IN_GAME
5. Game completes
6. Lobby transitions to FINISHED
```

## Matchmaking Module

**Purpose**: Automated player pairing for ranked games

### Key Files

- `matchmaking.ts` - Matchmaking endpoints
- `matchmaking/usecases/joinQueue.usecase.ts` - Queue joining
- `matchmaking/usecases/matchPlayers.usecase.ts` - Pairing logic
- `matchmaking/repositories/matchmaking.repository.ts` - Queue management

### Matchmaking Flow

```
1. Player joins queue (joinQueue)
2. Background job runs (matchPlayers)
3. Finds suitable opponents
4. Emits PlayersPairedEvent
5. Game module creates games
```

### Queue Entry

```typescript
interface MatchmakingEntry {
  userId: UserId;
  deckId: DeckId;
  status: 'queued' | 'matched';
  queuedAt: number;
}
```

### Matching Algorithm

Currently uses simple FIFO pairing. Future improvements could add:

- ELO-based matching
- Deck power level consideration
- Region-based matching

## Friend Module

**Purpose**: Friend relationships and requests

### Key Files

- `friends.ts` - Friend API endpoints
- `friend/usecases/sendFriendRequest.usecase.ts` - Request sending
- `friend/usecases/acceptFriendRequest.usecase.ts` - Request acceptance
- `friend/repositories/friend.repository.ts` - Friendship data

### Friend Request Flow

```
1. User A sends request to User B
2. FriendRequestSentEvent emitted
3. User B sees pending request
4. User B accepts request
5. FriendRequestAcceptedEvent emitted
6. Both users are now friends
```

### Events

- `FriendRequestSentEvent` - Request sent
- `FriendRequestAcceptedEvent` - Request accepted

## Gift Module

**Purpose**: In-game gift system

### Key Files

- `gifts.ts` - Gift API endpoints
- `gift/usecases/giveGift.usecase.ts` - Gift creation
- `gift/usecases/claimGift.usecase.ts` - Gift redemption

### Gift Types

```typescript
export const GIFT_KINDS = {
  CARD_PACK: 'card_pack',
  CURRENCY: 'currency',
  ITEM: 'item'
} as const;
```

### Gift States

```typescript
export const GIFT_STATES = {
  PENDING: 'pending',
  CLAIMED: 'claimed',
  EXPIRED: 'expired'
} as const;
```

## Shared Utilities

### Container (`shared/container.ts`)

Manages dependency injection:

```typescript
// Query container (read-only)
export const queryWithContainer = customQuery(queryWithSession, {
  args: {},
  input: async ctx => {
    const container = createQueryContainer(ctx);
    return { ctx: container, args: {} };
  }
});

// Mutation container (read-write)
export const mutationWithContainer = customMutation(mutationWithSession, {
  args: {},
  input: async ctx => {
    const container = createMutationContainer(ctx);
    return { ctx: container, args: {} };
  }
});
```

### Event Emitter (`shared/eventEmitter.ts`)

Type-safe event system:

```typescript
export type EventEmitter = TypedEventEmitter<EventMap>;
export const eventEmitter = new TypedEventEmitter<EventMap>('parallel');
```

### Utils

- `utils/email.ts` - Email value object
- `utils/password.ts` - Password value object and hashing
- `utils/error.ts` - AppError class
- `utils/randomString.ts` - Random string generation

## Module Dependencies

### Dependency Graph

```
┌────────┐
│  Auth  │──────┐
└────────┘      │
                ▼
┌────────┐   ┌────────┐
│  User  │◄──│  Deck  │◄──┐
└────────┘   └────────┘   │
    ▲           ▲          │
    │           │          │
┌────────┐   ┌────────┐   │
│  Game  │──►│  Card  │───┘
└────────┘   └────────┘
    ▲
    │
┌─────────────┐   ┌────────┐
│ Matchmaking │──►│ Lobby  │
└─────────────┘   └────────┘
    ▲                 ▲
    │                 │
┌────────┐       ┌────────┐
│ Friend │       │  Gift  │
└────────┘       └────────┘
```

### Key Relationships

- **Auth** creates users
- **Deck** subscribes to Auth events (grant starter deck)
- **Card** tracks ownership for Deck validation
- **Matchmaking** pairs players and triggers Game creation
- **Game** updates User stats on completion
- **Lobby** provides manual game creation
- **Friend** independent social feature
- **Gift** independent reward system

## Adding a New Module

### 1. Create Module Structure

```bash
mkdir src/convex/newmodule
mkdir src/convex/newmodule/{entities,repositories,usecases,mappers,events}
```

### 2. Define Schema

```typescript
// newmodule/newmodule.schemas.ts
export const newModuleSchemas = {
  newItems: defineTable({
    userId: v.id('users'),
    name: v.string(),
    createdAt: v.number()
  }).index('userId', ['userId'])
};
```

### 3. Create Entity Types

```typescript
// newmodule/entities/newItem.entity.ts
export type NewItem = Doc<'newItems'>;
export type NewItemId = NewItem['_id'];
```

### 4. Create Repository

```typescript
// newmodule/repositories/newItem.repository.ts
export class NewItemRepository {
  static INJECTION_KEY = 'newItemRepo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  async create(data: CreateNewItemData): Promise<NewItemId> {
    return this.ctx.db.insert('newItems', data);
  }
}
```

### 5. Create Use Case

```typescript
// newmodule/usecases/createNewItem.usecase.ts
export class CreateNewItemUseCase {
  static INJECTION_KEY = 'createNewItemUseCase' as const;

  constructor(
    private ctx: {
      newItemRepo: NewItemRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: CreateNewItemInput): Promise<NewItemId> {
    ensureAuthenticated(this.ctx.session);
    return this.ctx.newItemRepo.create({
      userId: this.ctx.session.userId,
      name: input.name
    });
  }
}
```

### 6. Register Dependencies

```typescript
// newmodule/newmodule.providers.ts
export const mutationDependencies = {
  [NewItemRepository.INJECTION_KEY]: {
    resolver: asClass(NewItemRepository)
  },
  [CreateNewItemUseCase.INJECTION_KEY]: {
    resolver: asClass(CreateNewItemUseCase)
  }
};
```

### 7. Create API Endpoint

```typescript
// newmodule.ts
export const create = mutationWithContainer({
  args: { name: v.string() },
  handler: async (container, args) => {
    const useCase = container.resolve<CreateNewItemUseCase>(
      CreateNewItemUseCase.INJECTION_KEY
    );
    return useCase.execute(args);
  }
});
```

### 8. Register in Schema

```typescript
// schema.ts
import { newModuleSchemas } from './newmodule/newmodule.schemas';

export default defineSchema({
  // ... existing schemas
  ...newModuleSchemas
});
```

### 9. Register in Container

```typescript
// shared/container.ts
import * as newModuleProviders from '../newmodule/newmodule.providers';

const makeMutationDependencies = ctx => ({
  // ... existing
  ...newModuleProviders.mutationDependencies
});
```

## Next Steps

- See [Common Tasks](./15-common-tasks.md) for practical guides
- Review [Architecture Overview](./01-architecture-overview.md)
- Understand [Event-Driven Architecture](./08-event-driven-architecture.md)
