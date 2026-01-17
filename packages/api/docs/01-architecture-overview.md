# Architecture Overview

## Introduction

The API package implements a **Clean Architecture** approach with clear separation of concerns. It uses **Convex** as the backend platform and **Awilix** for dependency injection.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│              (packages/client/src/)                     │
└─────────────────┬───────────────────────────────────────┘
                  │ Convex API Calls
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  API Endpoints Layer                    │
│        (auth.ts, games.ts, decks.ts, etc.)              │
│                                                         │
│  ┌────────────────────────────────────────────────┐     │
│  │         Dependency Container (Awilix)          │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  Business Logic Layer                   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Use Cases  │  │   Entities   │  │    Events    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  Data Access Layer                      │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Repositories │  │   Mappers    │  │  Validators  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Convex Database & Scheduler                │
└─────────────────────────────────────────────────────────┘
```

## Module Organization

The codebase is organized into domain modules, each containing:

```
module-name/
├── module-name.ts           # API endpoint definitions
├── module-name.providers.ts # Dependency registration
├── module-name.schema.ts    # Convex table schemas
├── module-name.constants.ts # Module constants
├── module-name.events.ts    # Event type definitions
├── entities/                # Entity type definitions
├── repositories/            # Data access layer
├── usecases/               # Business logic
├── mappers/                # Data transformation
├── events/                 # Event classes
└── subscribers/            # Event handlers
```

## Core Modules

### 1. **Auth Module** (`auth/`)

- User registration and login
- Session management
- Password hashing and validation
- Email verification

### 2. **User Module** (`users/`)

- User profile management
- Username validation
- User repository

### 3. **Game Module** (`game/`)

- Game lifecycle management
- Game state tracking
- Player management
- Game result recording

### 4. **Deck Module** (`deck/`)

- Deck creation and management
- Deck validation
- Card collection management

### 5. **Card Module** (`card/`)

- Card definitions
- Card ownership tracking
- Granting cards to users

### 6. **Lobby Module** (`lobby/`)

- Multiplayer lobby creation
- Player invitation system
- Lobby state management

### 7. **Matchmaking Module** (`matchmaking/`)

- Ranked matchmaking queue
- Player pairing algorithm
- Matchmaking state tracking

### 8. **Friend Module** (`friend/`)

- Friend requests
- Friend list management

### 9. **Gift Module** (`gift/`)

- In-game gift system
- Gift creation and claiming

## Key Architectural Patterns

### 1. Dependency Injection

All dependencies are managed through Awilix containers:

```typescript
// Query container for read-only operations
const queryContainer = createQueryContainer(ctx);
const useCase = queryContainer.resolve<GetDecksUseCase>('getDecksUseCase');

// Mutation container for write operations
const mutationContainer = createMutationContainer(ctx);
const useCase = mutationContainer.resolve<CreateDeckUseCase>('createDeckUseCase');
```

### 2. Use Case Pattern

Business logic is encapsulated in use cases:

```typescript
export class RegisterUseCase implements UseCase<RegisterInput, RegisterOutput> {
  static INJECTION_KEY = 'registerUseCase' as const;

  constructor(
    protected ctx: {
      userRepo: UserRepository;
      sessionRepo: SessionRepository;
      eventEmitter: EventEmitter;
    }
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    // Business logic here
  }
}
```

### 3. Repository Pattern

Data access is abstracted behind repositories:

```typescript
export class UserRepository {
  static INJECTION_KEY = 'userRepo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  async create(data: CreateUserData): Promise<UserId> {
    return this.ctx.db.insert('users', data);
  }
}
```

### 4. Event-Driven Architecture

Modules communicate through domain events:

```typescript
// Emit event
await eventEmitter.emit(AccountCreatedEvent.EVENT_NAME, new AccountCreatedEvent(userId));

// Subscribe to event
eventEmitter.on(AccountCreatedEvent.EVENT_NAME, async event => {
  // Handle event
});
```

## Data Flow

### Query Flow (Read Operations)

```
1. Client calls API endpoint
   ↓
2. queryWithContainer creates DI container with session
   ↓
3. Endpoint handler resolves use case from container
   ↓
4. Use case queries data via read repositories
   ↓
5. Mappers transform entities to DTOs
   ↓
6. Data returned to client
```

### Mutation Flow (Write Operations)

```
1. Client calls API endpoint
   ↓
2. mutationWithContainer creates DI container with session
   ↓
3. Endpoint handler resolves use case from container
   ↓
4. Use case validates and processes business logic
   ↓
5. Repository persists changes to database
   ↓
6. Domain events emitted for side effects
   ↓
7. Event subscribers handle async workflows
   ↓
8. Response returned to client
```

## Technology Choices

### Why Convex?

- **Real-time subscriptions**: Automatic UI updates
- **Type safety**: Generated TypeScript types
- **Serverless**: No infrastructure management
- **Transactional**: ACID guarantees
- **Scheduling**: Built-in task scheduler

### Why Awilix?

- **Constructor injection**: Clear dependencies
- **Lifetime management**: Proper scoping
- **Testing**: Easy to mock dependencies
- **Type safety**: Full TypeScript support

### Why Clean Architecture?

- **Testability**: Business logic isolated from framework
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Easy to change implementations
- **Scalability**: Organized code as project grows

## File Organization Principles

### 1. Feature-First Structure

Each domain module is self-contained with all its layers.

### 2. Consistent Naming

- `*.entity.ts` - Type definitions
- `*.repository.ts` - Data access
- `*.usecase.ts` - Business logic
- `*.mapper.ts` - Transformations
- `*.providers.ts` - DI registration
- `*.schema.ts` - Convex schemas
- `*.constants.ts` - Module constants
- `*.events.ts` - Event definitions

### 3. Explicit Dependencies

All dependencies are constructor-injected, making them visible and testable.

## Next Steps

- Learn about [Dependency Injection](./02-dependency-injection.md)
- Understand [Use Case Pattern](./03-use-case-pattern.md)
- Explore [Repository Pattern](./04-repository-pattern.md)
- See [Common Tasks](./15-common-tasks.md) for practical examples
