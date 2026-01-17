# Mappers

## Overview

Mappers transform data between different representations. They're primarily used to convert database entities to DTOs (Data Transfer Objects) for the client, hiding internal details and shaping data for specific use cases.

## Purpose

```
Database Entity → Mapper → DTO (for client)
     (internal)            (public API)
```

Benefits:

- Decouple internal representation from API
- Control what data is exposed to clients
- Add computed fields
- Transform data formats
- Version your API independently

## Basic Mapper Structure

```typescript
export class UserMapper {
  static INJECTION_KEY = 'userMapper' as const;

  toDto(user: User): UserDto {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
      // Note: hashedPassword is NOT included
    };
  }
}
```

## Mapper with Dependencies

```typescript
export class DeckMapper {
  static INJECTION_KEY = 'deckMapper' as const;

  constructor(
    private ctx: {
      cardRepo: CardReadRepository;
    }
  ) {}

  async toDto(deck: Deck): Promise<DeckDto> {
    // Fetch related data
    const cards = await Promise.all(
      deck.cards.map(c => this.ctx.cardRepo.getById(c.cardId))
    );

    return {
      id: deck._id,
      name: deck.name,
      cards: cards.map(card => ({
        id: card._id,
        name: card.name,
        quantity: deck.cards.find(c => c.cardId === card._id)?.quantity ?? 0
      })),
      isValid: deck.isValid,
      createdAt: deck.createdAt
    };
  }
}
```

## Real-World Examples

### Example 1: User Mapper

```typescript
// users/mappers/user.mapper.ts
import type { User } from '../entities/user.entity';

export interface UserDto {
  id: UserId;
  username: string;
  email: string;
  createdAt: number;
  stats?: {
    wins: number;
    losses: number;
    winRate: number;
  };
}

export class UserMapper {
  static INJECTION_KEY = 'userMapper' as const;

  constructor(
    private ctx: {
      gamePlayerRepo?: GamePlayerReadRepository;
    }
  ) {}

  toDto(user: User): UserDto {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };
  }

  async toDtoWithStats(user: User): Promise<UserDto> {
    const baseDto = this.toDto(user);

    // Add computed stats
    if (this.ctx.gamePlayerRepo) {
      const games = await this.ctx.gamePlayerRepo.getByUserId(user._id);
      const wins = games.filter(g => g.result === 'win').length;
      const losses = games.filter(g => g.result === 'loss').length;
      const total = games.length;

      baseDto.stats = {
        wins,
        losses,
        winRate: total > 0 ? wins / total : 0
      };
    }

    return baseDto;
  }

  toPublicDto(user: User): Omit<UserDto, 'email'> {
    // For public profiles - don't expose email
    const dto = this.toDto(user);
    const { email, ...publicDto } = dto;
    return publicDto;
  }
}
```

### Example 2: Game Mapper

```typescript
// game/mappers/game.mapper.ts
export interface GameDto {
  id: GameId;
  status: GameStatus;
  players: GamePlayerDto[];
  winnerId?: UserId;
  startedAt: number;
  finishedAt?: number;
  duration?: number;
}

export interface GamePlayerDto {
  userId: UserId;
  username: string;
  deckName: string;
  result?: 'win' | 'loss' | 'draw';
}

export class GameMapper {
  static INJECTION_KEY = 'gameMapper' as const;

  constructor(
    private ctx: {
      gamePlayerRepo: GamePlayerReadRepository;
      userRepo: UserReadRepository;
      deckRepo: DeckReadRepository;
    }
  ) {}

  async toDto(game: Game): Promise<GameDto> {
    // Get players
    const gamePlayers = await this.ctx.gamePlayerRepo.getByGameId(game._id);

    // Fetch related data in parallel
    const players = await Promise.all(
      gamePlayers.map(async gp => {
        const [user, deck] = await Promise.all([
          this.ctx.userRepo.getById(gp.userId),
          this.ctx.deckRepo.getById(gp.deckId)
        ]);

        return {
          userId: gp.userId,
          username: user?.username ?? 'Unknown',
          deckName: deck?.name ?? 'Unknown',
          result: gp.result
        };
      })
    );

    // Calculate duration if finished
    const duration = game.finishedAt ? game.finishedAt - game.startedAt : undefined;

    return {
      id: game._id,
      status: game.status,
      players,
      winnerId: game.winnerId,
      startedAt: game.startedAt,
      finishedAt: game.finishedAt,
      duration
    };
  }

  toListItemDto(game: Game, players: GamePlayerDto[]): GameListItemDto {
    // Simpler DTO for list views
    return {
      id: game._id,
      status: game.status,
      playerCount: players.length,
      startedAt: game.startedAt
    };
  }
}
```

### Example 3: Lobby Mapper

```typescript
// lobby/mappers/lobby.mapper.ts
export interface LobbyDto {
  id: LobbyId;
  name: string;
  creator: {
    id: UserId;
    username: string;
  };
  players: LobbyPlayerDto[];
  status: LobbyStatus;
  maxPlayers: number;
  createdAt: number;
}

export interface LobbyPlayerDto {
  userId: UserId;
  username: string;
  deckId: DeckId;
  deckName: string;
  role: LobbyUserRole;
  joinedAt: number;
}

export class LobbyMapper {
  static INJECTION_KEY = 'lobbyMapper' as const;

  constructor(
    private ctx: {
      lobbyPlayerRepo: LobbyPlayerReadRepository;
      userRepo: UserReadRepository;
      deckRepo: DeckReadRepository;
    }
  ) {}

  async toDto(lobby: Lobby): Promise<LobbyDto> {
    // Get creator
    const creator = await this.ctx.userRepo.getById(lobby.creatorId);
    if (!creator) {
      throw new AppError('Lobby creator not found');
    }

    // Get players
    const lobbyPlayers = await this.ctx.lobbyPlayerRepo.getByLobbyId(lobby._id);

    // Fetch player details in parallel
    const players = await Promise.all(
      lobbyPlayers.map(async lp => {
        const [user, deck] = await Promise.all([
          this.ctx.userRepo.getById(lp.userId),
          this.ctx.deckRepo.getById(lp.deckId)
        ]);

        return {
          userId: lp.userId,
          username: user?.username ?? 'Unknown',
          deckId: lp.deckId,
          deckName: deck?.name ?? 'Unknown',
          role: lp.role,
          joinedAt: lp.joinedAt
        };
      })
    );

    return {
      id: lobby._id,
      name: lobby.name,
      creator: {
        id: creator._id,
        username: creator.username
      },
      players,
      status: lobby.status,
      maxPlayers: lobby.maxPlayers,
      createdAt: lobby.createdAt
    };
  }
}
```

## Mapper Patterns

### Pattern 1: Multiple DTOs for Different Use Cases

```typescript
export class DeckMapper {
  // Minimal DTO for lists
  toListItemDto(deck: Deck): DeckListItemDto {
    return {
      id: deck._id,
      name: deck.name,
      cardCount: deck.cards.length,
      isValid: deck.isValid
    };
  }

  // Detailed DTO for single view
  async toDetailDto(deck: Deck): Promise<DeckDetailDto> {
    const cards = await this.fetchCards(deck);

    return {
      id: deck._id,
      name: deck.name,
      cards: cards.map(c => ({
        id: c._id,
        name: c.name,
        cost: c.cost,
        attack: c.attack,
        defense: c.defense,
        quantity: deck.cards.find(dc => dc.cardId === c._id)?.quantity ?? 0
      })),
      isValid: deck.isValid,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt
    };
  }

  // For editing
  toEditDto(deck: Deck): DeckEditDto {
    return {
      id: deck._id,
      name: deck.name,
      cards: deck.cards
    };
  }
}
```

### Pattern 2: Nested Mappers

```typescript
export class GameMapper {
  constructor(
    private ctx: {
      userMapper: UserMapper;
      deckMapper: DeckMapper;
    }
  ) {}

  async toDto(game: Game): Promise<GameDto> {
    const players = await Promise.all(
      game.playerIds.map(async id => {
        const user = await this.userRepo.getById(id);
        // Use user mapper for consistent transformation
        return this.ctx.userMapper.toPublicDto(user);
      })
    );

    return {
      id: game._id,
      players
      // ... rest
    };
  }
}
```

### Pattern 3: Conditional Mapping

```typescript
export class UserMapper {
  toDto(user: User, options?: { includeEmail?: boolean }): UserDto {
    const dto: UserDto = {
      id: user._id,
      username: user.username,
      createdAt: user.createdAt
    };

    if (options?.includeEmail) {
      dto.email = user.email;
    }

    return dto;
  }
}
```

### Pattern 4: Batch Mapping

```typescript
export class DeckMapper {
  async toDtos(decks: Deck[]): Promise<DeckDto[]> {
    // Collect all card IDs
    const allCardIds = decks.flatMap(d => d.cards.map(c => c.cardId));
    const uniqueCardIds = [...new Set(allCardIds)];

    // Fetch all cards at once
    const cards = await Promise.all(
      uniqueCardIds.map(id => this.ctx.cardRepo.getById(id))
    );
    const cardMap = new Map(cards.map(c => [c._id, c]));

    // Map decks using cached cards
    return decks.map(deck => ({
      id: deck._id,
      name: deck.name,
      cards: deck.cards.map(dc => {
        const card = cardMap.get(dc.cardId);
        return {
          id: dc.cardId,
          name: card?.name ?? 'Unknown',
          quantity: dc.quantity
        };
      })
    }));
  }
}
```

## Using Mappers in Use Cases

```typescript
export class GetDecksUseCase {
  constructor(
    protected ctx: {
      deckRepo: DeckReadRepository;
      deckMapper: DeckMapper;
      session: AuthSession | null;
    }
  ) {}

  async execute(): Promise<DeckDto[]> {
    ensureAuthenticated(this.ctx.session);

    // Get entities
    const decks = await this.ctx.deckRepo.getByUserId(this.ctx.session.userId);

    // Transform to DTOs
    return this.ctx.deckMapper.toDtos(decks);
  }
}
```

## Reverse Mapping (DTO to Entity)

Sometimes you need to map from DTO to entity (e.g., for updates):

```typescript
export class DeckMapper {
  toEntity(dto: CreateDeckDto): CreateDeckData {
    return {
      name: dto.name,
      cards: dto.cards.map(c => ({
        cardId: c.cardId,
        quantity: c.quantity
      })),
      isValid: this.validateDeck(dto.cards),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  toUpdateData(dto: UpdateDeckDto): Partial<Deck> {
    const update: Partial<Deck> = {
      updatedAt: Date.now()
    };

    if (dto.name !== undefined) {
      update.name = dto.name;
    }

    if (dto.cards !== undefined) {
      update.cards = dto.cards;
      update.isValid = this.validateDeck(dto.cards);
    }

    return update;
  }
}
```

## Best Practices

### 1. Keep Mappers Focused

```typescript
// Good: Focused on transformation
export class UserMapper {
  toDto(user: User): UserDto {
    return {
      id: user._id,
      username: user.username
    };
  }
}

// Bad: Business logic in mapper
export class UserMapper {
  toDto(user: User): UserDto {
    if (user.isBanned) {
      throw new AppError('User is banned');
    }
    // ...
  }
}
```

### 2. Don't Expose Internal IDs

```typescript
// Good: Clean public API
export interface GameDto {
  id: GameId;
  players: PlayerDto[];
}

// Bad: Exposing internal references
export interface GameDto {
  _id: GameId;
  playerIds: UserId[]; // Makes client fetch players
}
```

### 3. Optimize for Common Use Cases

```typescript
// Good: Different methods for different needs
toListItemDto(entity): ListItemDto
toDetailDto(entity): DetailDto
toEditDto(entity): EditDto

// Bad: One size fits all
toDto(entity, options?: {
  includeA?: boolean;
  includeB?: boolean;
  includeC?: boolean;
  // ...
}): Dto
```

### 4. Use Batch Operations

```typescript
// Good: Batch fetch related data
async toDtos(decks: Deck[]): Promise<DeckDto[]> {
  const allCardIds = decks.flatMap(d => d.cards);
  const cards = await this.fetchCardsInBatch(allCardIds);
  return decks.map(d => this.mapWithCards(d, cards));
}

// Bad: N+1 queries
async toDtos(decks: Deck[]): Promise<DeckDto[]> {
  return Promise.all(
    decks.map(d => this.toDto(d)) // Each calls DB
  );
}
```

## Testing Mappers

```typescript
describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(() => {
    mapper = new UserMapper({});
  });

  it('maps user to DTO', () => {
    const user: User = {
      _id: 'user_123',
      username: 'testuser',
      email: 'test@example.com',
      hashedPassword: 'hashed',
      createdAt: 1000
    };

    const dto = mapper.toDto(user);

    expect(dto).toEqual({
      id: 'user_123',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: 1000
    });

    // Ensure password not included
    expect(dto).not.toHaveProperty('hashedPassword');
  });

  it('maps to public DTO without email', () => {
    const user: User = {
      _id: 'user_123',
      username: 'testuser',
      email: 'test@example.com',
      hashedPassword: 'hashed',
      createdAt: 1000
    };

    const dto = mapper.toPublicDto(user);

    expect(dto).not.toHaveProperty('email');
  });
});
```

## Common Pitfalls

### ❌ N+1 Query Problem

```typescript
// Bad: Queries in loop
async toDtos(decks: Deck[]): Promise<DeckDto[]> {
  return Promise.all(
    decks.map(async deck => {
      const creator = await this.userRepo.getById(deck.userId);
      return { ...deck, creatorName: creator.username };
    })
  );
}

// Good: Batch fetch
async toDtos(decks: Deck[]): Promise<DeckDto[]> {
  const userIds = [...new Set(decks.map(d => d.userId))];
  const users = await this.userRepo.getByIds(userIds);
  const userMap = new Map(users.map(u => [u._id, u]));

  return decks.map(deck => ({
    ...deck,
    creatorName: userMap.get(deck.userId)?.username ?? 'Unknown'
  }));
}
```

### ❌ Exposing Sensitive Data

```typescript
// Bad: Leaking internal data
toDto(user: User): UserDto {
  return { ...user }; // Includes hashedPassword!
}

// Good: Explicit mapping
toDto(user: User): UserDto {
  return {
    id: user._id,
    username: user.username
    // hashedPassword deliberately omitted
  };
}
```

## Next Steps

- Learn about [Entities and Schemas](./05-entities-and-schemas.md)
- Understand [Repository Pattern](./04-repository-pattern.md)
- See [Common Tasks](./15-common-tasks.md) for mapper examples
