# Guards and Authorization

## Overview

Guards are functions that check authorization rules and business constraints. They ensure users can only perform actions they're allowed to.

## Authentication Guards

### ensureAuthenticated

The most basic guard - ensures user is logged in:

```typescript
export function ensureAuthenticated(
  session: AuthSession | null
): asserts session is AuthSession {
  if (!session) {
    throw new AppError('Authentication required');
  }
}
```

Usage:

```typescript
export class CreateDeckUseCase {
  async execute(input: CreateDeckInput): Promise<DeckId> {
    ensureAuthenticated(this.ctx.session);

    // TypeScript now knows session is not null
    const userId = this.ctx.session.userId;
  }
}
```

## Ownership Guards

### Example: Deck Ownership

```typescript
// deck/deck.guards.ts
export function ensureDeckOwnership(deck: Deck, userId: UserId): void {
  if (deck.userId !== userId) {
    throw new AppError('You do not own this deck');
  }
}
```

Usage:

```typescript
export class UpdateDeckUseCase {
  async execute(input: UpdateDeckInput): Promise<void> {
    ensureAuthenticated(this.ctx.session);

    const deck = await this.ctx.deckRepo.getById(input.deckId);
    if (!deck) {
      throw new AppError('Deck not found');
    }

    // Check ownership
    ensureDeckOwnership(deck, this.ctx.session.userId);

    // Now safe to update
    await this.ctx.deckRepo.update(input.deckId, {
      name: input.name,
      cards: input.cards
    });
  }
}
```

### Example: Game Participation

```typescript
// game/game.guards.ts
export function ensurePlayerInGame(
  game: Game,
  gamePlayers: GamePlayer[],
  userId: UserId
): void {
  const isPlayer = gamePlayers.some(p => p.userId === userId);

  if (!isPlayer) {
    throw new AppError('You are not a player in this game');
  }
}
```

### Example: Lobby Creator

```typescript
// lobby/lobby.guards.ts
export function ensureLobbyCreator(lobby: Lobby, userId: UserId): void {
  if (lobby.creatorId !== userId) {
    throw new AppError('Only the lobby creator can perform this action');
  }
}
```

## State Guards

### Example: Game State

```typescript
// game/game.guards.ts
export function ensureGameActive(game: Game): void {
  if (game.status !== GAME_STATUS.ACTIVE) {
    throw new AppError('Game is not active');
  }
}

export function ensureGameNotStarted(game: Game): void {
  if (game.status !== GAME_STATUS.PENDING) {
    throw new AppError('Game already started');
  }
}

export function ensureGameFinished(game: Game): void {
  if (game.status !== GAME_STATUS.FINISHED) {
    throw new AppError('Game is not finished yet');
  }
}
```

Usage:

```typescript
export class FinishGameUseCase {
  async execute(input: FinishGameInput): Promise<void> {
    const game = await this.ctx.gameRepo.getById(input.gameId);
    if (!game) {
      throw new AppError('Game not found');
    }

    // Ensure game is in correct state
    ensureGameActive(game);

    // Finish game...
  }
}
```

### Example: Lobby State

```typescript
// lobby/lobby.guards.ts
export function ensureLobbyWaiting(lobby: Lobby): void {
  if (lobby.status !== LOBBY_STATUS.WAITING) {
    throw new AppError('Lobby is not accepting players');
  }
}

export function ensureLobbyNotFull(lobby: Lobby): void {
  if (lobby.players.length >= lobby.maxPlayers) {
    throw new AppError('Lobby is full');
  }
}
```

## Capacity Guards

```typescript
// deck/deck.guards.ts
export const MAX_DECKS_PER_USER = 10;

export async function ensureCanCreateDeck(
  deckRepo: DeckReadRepository,
  userId: UserId
): Promise<void> {
  const userDecks = await deckRepo.getByUserId(userId);

  if (userDecks.length >= MAX_DECKS_PER_USER) {
    throw new AppError(`You can only have ${MAX_DECKS_PER_USER} decks`);
  }
}
```

## Business Rule Guards

### Example: Deck Validation

```typescript
// deck/deck.guards.ts
export const DECK_MIN_SIZE = 30;
export const DECK_MAX_SIZE = 40;
export const MAX_COPIES_PER_CARD = 3;

export function ensureValidDeckSize(cards: DeckCard[]): void {
  const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);

  if (totalCards < DECK_MIN_SIZE) {
    throw new AppError(`Deck must have at least ${DECK_MIN_SIZE} cards`);
  }

  if (totalCards > DECK_MAX_SIZE) {
    throw new AppError(`Deck cannot have more than ${DECK_MAX_SIZE} cards`);
  }
}

export function ensureValidCardCopies(cards: DeckCard[]): void {
  for (const card of cards) {
    if (card.quantity > MAX_COPIES_PER_CARD) {
      throw new AppError(`Cannot have more than ${MAX_COPIES_PER_CARD} copies of a card`);
    }
  }
}

export function ensureUserOwnsCards(deckCards: DeckCard[], userCards: CardCopy[]): void {
  const userCardIds = new Set(userCards.map(c => c.cardId));

  for (const deckCard of deckCards) {
    if (!userCardIds.has(deckCard.cardId)) {
      throw new AppError(`You don't own card ${deckCard.cardId}`);
    }

    const ownedCopies = userCards.filter(c => c.cardId === deckCard.cardId).length;

    if (ownedCopies < deckCard.quantity) {
      throw new AppError(`Not enough copies of card ${deckCard.cardId}`);
    }
  }
}
```

Usage:

```typescript
export class CreateDeckUseCase {
  async execute(input: CreateDeckInput): Promise<DeckId> {
    ensureAuthenticated(this.ctx.session);

    // Check deck limits
    await ensureCanCreateDeck(this.ctx.deckReadRepo, this.ctx.session.userId);

    // Validate deck composition
    ensureValidDeckSize(input.cards);
    ensureValidCardCopies(input.cards);

    // Check card ownership
    const userCards = await this.ctx.cardRepo.getUserCards(this.ctx.session.userId);
    ensureUserOwnsCards(input.cards, userCards);

    // Create deck
    return this.ctx.deckRepo.create({
      userId: this.ctx.session.userId,
      name: input.name,
      cards: input.cards
    });
  }
}
```

## Role-Based Guards

### Example: Admin Check

```typescript
// users/user.guards.ts
export function ensureAdmin(user: User): void {
  if (user.role !== 'admin') {
    throw new AppError('Admin access required');
  }
}

export function ensureModerator(user: User): void {
  if (user.role !== 'admin' && user.role !== 'moderator') {
    throw new AppError('Moderator access required');
  }
}
```

### Example: Lobby Roles

```typescript
// lobby/lobby.guards.ts
export function ensureLobbyRole(
  lobbyPlayer: LobbyPlayer,
  requiredRole: LobbyUserRole
): void {
  if (lobbyPlayer.role !== requiredRole) {
    throw new AppError(`${requiredRole} role required`);
  }
}

export function ensureCanInvite(lobbyPlayer: LobbyPlayer): void {
  if (
    lobbyPlayer.role !== LOBBY_USER_ROLES.CREATOR &&
    lobbyPlayer.role !== LOBBY_USER_ROLES.ADMIN
  ) {
    throw new AppError('Only creators and admins can invite players');
  }
}
```

## Guard Composition

Combine multiple guards:

```typescript
export class KickPlayerUseCase {
  async execute(input: KickPlayerInput): Promise<void> {
    ensureAuthenticated(this.ctx.session);

    const lobby = await this.ctx.lobbyRepo.getById(input.lobbyId);
    if (!lobby) {
      throw new AppError('Lobby not found');
    }

    // Multiple guards
    ensureLobbyWaiting(lobby);
    ensureLobbyCreator(lobby, this.ctx.session.userId);

    const targetPlayer = await this.ctx.lobbyPlayerRepo.getByUserIdAndLobbyId(
      input.targetUserId,
      input.lobbyId
    );

    if (!targetPlayer) {
      throw new AppError('Player not in lobby');
    }

    // Can't kick yourself
    if (input.targetUserId === this.ctx.session.userId) {
      throw new AppError('Cannot kick yourself');
    }

    // Kick player
    await this.ctx.lobbyPlayerRepo.delete(targetPlayer._id);
  }
}
```

## Advanced Authorization with CASL

If you need complex authorization rules, use CASL:

```typescript
// Example (not yet implemented in codebase)
import { defineAbility } from '@casl/ability';

export function defineAbilitiesFor(user: User) {
  return defineAbility((can, cannot) => {
    // Everyone can read public data
    can('read', 'User');
    can('read', 'Deck', { isPublic: true });

    if (user) {
      // Logged in users can manage own resources
      can('manage', 'Deck', { userId: user._id });
      can('manage', 'Profile', { userId: user._id });
    }

    if (user?.role === 'admin') {
      // Admins can do everything
      can('manage', 'all');
    }
  });
}

// Usage
export class UpdateDeckUseCase {
  async execute(input: UpdateDeckInput): Promise<void> {
    ensureAuthenticated(this.ctx.session);

    const user = await this.ctx.userRepo.getById(this.ctx.session.userId);
    const deck = await this.ctx.deckRepo.getById(input.deckId);

    const ability = defineAbilitiesFor(user);

    if (!ability.can('update', 'Deck', deck)) {
      throw new AppError('Not authorized to update this deck');
    }

    // Update deck...
  }
}
```

## Best Practices

### 1. Fail Fast

Check guards early in use case:

```typescript
// Good: Check at start
async execute(input: UpdateInput) {
  ensureAuthenticated(this.ctx.session);
  const entity = await this.repo.getById(input.id);
  ensureOwnership(entity, this.ctx.session.userId);

  // Business logic...
}

// Bad: Check after work done
async execute(input: UpdateInput) {
  // Do work...
  const entity = await this.repo.getById(input.id);
  // Process...
  ensureOwnership(entity, this.ctx.session.userId); // Too late!
}
```

### 2. Use Type Guards

```typescript
export function ensureAuthenticated(
  session: AuthSession | null
): asserts session is AuthSession {
  // TypeScript assertion function
  if (!session) {
    throw new AppError('Not authenticated');
  }
}
```

### 3. Descriptive Error Messages

```typescript
// Good
throw new AppError('Only the lobby creator can start the game');

// Bad
throw new AppError('Unauthorized');
```

### 4. Separate Guard Functions

```typescript
// Good: Small, focused guards
ensureAuthenticated(session);
ensureDeckOwnership(deck, userId);
ensureValidDeckSize(cards);

// Bad: One giant guard
ensureCanUpdateDeck(session, deck, cards, userId);
```

## Testing Guards

```typescript
describe('ensureDeckOwnership', () => {
  it('allows owner to access deck', () => {
    const deck = { userId: 'user_1' } as Deck;

    expect(() => {
      ensureDeckOwnership(deck, 'user_1');
    }).not.toThrow();
  });

  it('throws for non-owner', () => {
    const deck = { userId: 'user_1' } as Deck;

    expect(() => {
      ensureDeckOwnership(deck, 'user_2');
    }).toThrow('You do not own this deck');
  });
});

describe('ensureValidDeckSize', () => {
  it('allows valid deck size', () => {
    const cards = Array(30).fill({ cardId: 'card_1', quantity: 1 });

    expect(() => {
      ensureValidDeckSize(cards);
    }).not.toThrow();
  });

  it('throws for too few cards', () => {
    const cards = Array(20).fill({ cardId: 'card_1', quantity: 1 });

    expect(() => {
      ensureValidDeckSize(cards);
    }).toThrow('Deck must have at least 30 cards');
  });
});
```

## Common Patterns

### Guard + Fetch Pattern

```typescript
async function getAndVerifyDeck(
  deckRepo: DeckRepository,
  deckId: DeckId,
  userId: UserId
): Promise<Deck> {
  const deck = await deckRepo.getById(deckId);

  if (!deck) {
    throw new AppError('Deck not found');
  }

  ensureDeckOwnership(deck, userId);

  return deck;
}

// Usage
const deck = await getAndVerifyDeck(
  this.ctx.deckRepo,
  input.deckId,
  this.ctx.session.userId
);
```

## Next Steps

- Learn about [Authentication](./07-authentication.md)
- Understand [Error Handling](./12-error-handling.md)
- See [Common Tasks](./15-common-tasks.md) for authorization patterns
