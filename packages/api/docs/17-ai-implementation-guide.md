# AI Implementation Guide

**Purpose**: This guide provides prescriptive, checklist-driven instructions optimized for AI assistants implementing features in this API package.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Feature Implementation Workflow](#feature-implementation-workflow)
3. [Decision Matrices](#decision-matrices)
4. [File Location Rules](#file-location-rules)
5. [Validation Checklists](#validation-checklists)
6. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
7. [Implementation Templates](#implementation-templates)

---

## Quick Reference

### When to Create What

| Scenario                   | Create                  |
| -------------------------- | ----------------------- |
| New business operation     | Use Case + API Endpoint |
| New data access pattern    | Repository method       |
| New validation logic       | Value Object or Guard   |
| New domain concept         | Entity + Schema         |
| Cross-module communication | Event + Subscriber      |
| Data transformation        | Mapper                  |
| Background/scheduled task  | Internal Function       |

### File Naming Conventions

```
{Entity}.entity.ts          // Domain entities
{Entity}.repository.ts      // Data access
{Action}.usecase.ts         // Business logic
{Domain}.schemas.ts         // Database schemas
{Domain}.providers.ts       // DI registration
{Domain}.guards.ts          // Authorization
{Entity}.mapper.ts          // DTO transformations
{Domain}.subscribers.ts     // Event handlers
{Event}.event.ts           // Event definitions
```

---

## Feature Implementation Workflow

### Phase 1: Planning (MUST DO FIRST)

**Before writing any code:**

1. **Identify the domain module** (auth, game, deck, etc.)
2. **Determine operation type**: Query (read) or Mutation (write)?
3. **Check authentication requirement**: Public or requires session?
4. **List required dependencies**: Repos, services, session?
5. **Identify events to emit**: What should other modules know?
6. **Consider authorization**: Ownership checks, role checks?

### Phase 2: Implementation Order

**Follow this exact order:**

#### Step 1: Schema (if needed)

- [ ] Add/modify table schema in `{domain}/{domain}.schemas.ts`
- [ ] Add necessary indexes for queries
- [ ] Update schema composition in `convex/schema.ts`

#### Step 2: Entity (if needed)

- [ ] Create entity type in `{domain}/entities/{entity}.entity.ts`
- [ ] Define branded ID type: `export type EntityId = Id<'tableName'>`
- [ ] Add entity interface with all required properties

#### Step 3: Repository Method (if needed)

- [ ] Determine if read or write operation
- [ ] Add method to `{Entity}ReadRepository` or `{Entity}Repository`
- [ ] Use proper indexes for queries
- [ ] Return entity types, not raw database records

#### Step 4: Value Objects & Guards (if needed)

- [ ] Create value objects for validated inputs in `{domain}/{valueName}.ts`
- [ ] Create guards for authorization in `{domain}/{domain}.guards.ts`
- [ ] Add validation tests

#### Step 5: Events (if needed)

- [ ] Define event class in `{domain}/events/{event}.event.ts`
- [ ] Add to event map in `{domain}/{domain}.events.ts`
- [ ] Create/update subscribers in relevant modules

#### Step 6: Use Case

- [ ] Create use case in `{domain}/usecases/{action}.usecase.ts`
- [ ] Define input/output interfaces
- [ ] Implement `UseCase<TInput, TOutput>` interface
- [ ] Add `static INJECTION_KEY` constant
- [ ] Define constructor with dependency types
- [ ] Implement `execute()` method with business logic
- [ ] Add authentication checks if needed
- [ ] Add authorization guards if needed
- [ ] Emit events if needed

#### Step 7: DI Registration

- [ ] Register use case in `{domain}/{domain}.providers.ts`
- [ ] Use `queryDependencies` for queries, `mutationDependencies` for mutations
- [ ] Use `asClass()` for services, `asValue()` for primitives
- [ ] Mark eager initialization for subscribers: `eager: true`

#### Step 8: API Endpoint

- [ ] Create/update endpoint in `convex/{domain-plural}.ts`
- [ ] Use `queryWithContainer` for queries
- [ ] Use `mutationWithContainer` for mutations
- [ ] Use `internalMutationWithContainer` for internal functions
- [ ] Define args with Convex validators (`v.*`)
- [ ] Resolve use case from container
- [ ] Call `useCase.execute(args)`
- [ ] Return result

#### Step 9: Mapper (if needed)

- [ ] Create mapper in `{domain}/mappers/{entity}.mapper.ts`
- [ ] Define DTO interface
- [ ] Implement `toDto()` and `toDtos()` methods
- [ ] Register mapper in providers

#### Step 10: Type Exports

- [ ] Export new types from `src/index.ts`
- [ ] Export entities, DTOs, IDs
- [ ] Do NOT export repositories or use cases

---

## Decision Matrices

### Where Does Logic Go?

```
┌─────────────────────┬─────────────────────────────────────┐
│ Logic Type          │ Location                            │
├─────────────────────┼─────────────────────────────────────┤
│ Business rules      │ Use Case                            │
│ Validation          │ Value Object or Guard               │
│ Authorization       │ Guard (called from Use Case)        │
│ Data access         │ Repository                          │
│ Data transformation │ Mapper                              │
│ Cross-module comm   │ Event + Subscriber                  │
│ API contract        │ Endpoint args/return                │
└─────────────────────┴─────────────────────────────────────┘
```

### Read vs Write Repository

```
┌─────────────────────┬─────────────────────────────────────┐
│ Operation           │ Repository Type                     │
├─────────────────────┼─────────────────────────────────────┤
│ Query by ID         │ ReadRepository                      │
│ Query by index      │ ReadRepository                      │
│ List with filters   │ ReadRepository                      │
│ Insert              │ WriteRepository                     │
│ Update              │ WriteRepository                     │
│ Delete              │ WriteRepository                     │
│ Check existence     │ ReadRepository                      │
└─────────────────────┴─────────────────────────────────────┘
```

### Authentication Strategy

```
┌─────────────────────┬─────────────────────────────────────┐
│ Endpoint Type       │ Wrapper to Use                      │
├─────────────────────┼─────────────────────────────────────┤
│ Public query        │ queryWithContainer                  │
│ Authenticated query │ queryWithContainer + ensureAuth     │
│ Public mutation     │ mutationWithContainer               │
│ Authenticated mut   │ mutationWithContainer + ensureAuth  │
│ Internal only       │ internalMutationWithContainer       │
│ Scheduled job       │ internalMutationWithContainer       │
└─────────────────────┴─────────────────────────────────────┘
```

### Event vs Direct Call

```
Use Event When:
✓ Multiple modules need to react
✓ Reaction is not critical to primary operation
✓ Decoupling is desired
✓ Async processing is acceptable

Use Direct Call When:
✓ Single module reaction
✓ Result affects primary operation
✓ Transactional consistency required
✓ Immediate result needed
```

---

## File Location Rules

### Directory Structure per Module

```
{domain}/
├── entities/
│   ├── {entity}.entity.ts          // Domain types
│   └── {aggregate}.entity.ts
├── repositories/
│   └── {entity}.repository.ts      // Data access
├── usecases/
│   ├── {action}.usecase.ts         // Business logic
│   └── {action}.usecase.test.ts    // Tests
├── mappers/
│   └── {entity}.mapper.ts          // Transformations
├── events/
│   └── {event}.event.ts            // Event classes
├── {domain}.schemas.ts             // Convex schemas
├── {domain}.providers.ts           // DI registration
├── {domain}.guards.ts              // Authorization
├── {domain}.events.ts              // Event type map
└── {domain}.subscribers.ts         // Event handlers
```

### Convex Root Files

```
convex/
├── schema.ts                        // Schema composition
├── {domain-plural}.ts               // API endpoints
├── auth.ts                          // Auth endpoints
├── usecase.ts                       // Base UseCase interface
├── cron.ts                          // Scheduled jobs
└── shared/
    ├── container.ts                 // DI setup
    └── session.ts                   // Session helpers
```

### Strict Rules

1. **Entities** never import infrastructure (repos, db)
2. **Repositories** only import entities and database types
3. **Use Cases** orchestrate between repos and entities
4. **API endpoints** only resolve use cases, never contain business logic
5. **Subscribers** are registered in `{domain}.providers.ts` with `eager: true`

---

## Validation Checklists

### After Adding Use Case

- [ ] Input/output interfaces defined
- [ ] `UseCase<TInput, TOutput>` implemented
- [ ] `INJECTION_KEY` static property added
- [ ] Constructor dependencies typed
- [ ] `execute()` method implemented
- [ ] Authentication checked (if required)
- [ ] Authorization enforced (if required)
- [ ] Events emitted (if needed)
- [ ] Registered in `{domain}.providers.ts`
- [ ] Tests written

### After Adding Repository Method

- [ ] Method in correct repository (Read vs Write)
- [ ] Uses proper index for queries
- [ ] Returns entity types (not raw DB records)
- [ ] Handles not-found cases
- [ ] Includes timestamps (createdAt/updatedAt)
- [ ] Method name follows convention (`getById`, `getByUserId`, etc.)

### After Adding API Endpoint

- [ ] Correct wrapper used (query/mutation/internal)
- [ ] Args defined with Convex validators
- [ ] Use case resolved from container
- [ ] Use case executed with args
- [ ] Result returned (no additional logic)
- [ ] Function exported from file
- [ ] Types exported from `src/index.ts` (if needed)

### After Adding Schema

- [ ] All required fields included
- [ ] Indexes added for query patterns
- [ ] Foreign keys use `v.id('tableName')`
- [ ] Optional fields use `v.optional()`
- [ ] Schema added to composition in `convex/schema.ts`
- [ ] Timestamps included (createdAt, updatedAt)

### After Adding Event

- [ ] Event class created in `events/` folder
- [ ] `static EVENT_NAME` constant defined
- [ ] Constructor accepts data payload
- [ ] Event added to module event map
- [ ] Emitted in appropriate use case
- [ ] Subscriber created to handle event
- [ ] Subscriber registered with `eager: true`

---

## Common Mistakes to Avoid

### ❌ NEVER Do This

**1. Business Logic in API Endpoints**

```typescript
// ❌ BAD
export const createDeck = mutationWithContainer({
  handler: async (container, args) => {
    const db = container.resolve('db');
    // Don't put logic here!
    if (args.cards.length > 40) {
      throw new Error('Too many cards');
    }
    return await db.insert('decks', args);
  }
});

// ✅ GOOD
export const createDeck = mutationWithContainer({
  handler: async (container, args) => {
    const useCase = container.resolve<CreateDeckUseCase>(CreateDeckUseCase.INJECTION_KEY);
    return useCase.execute(args);
  }
});
```

**2. Entities Importing Repositories**

```typescript
// ❌ BAD - entities should NOT import infrastructure
import type { UserRepository } from '../repositories/user.repository';

export class Game {
  constructor(private userRepo: UserRepository) {}
}

// ✅ GOOD - entities are pure domain types
export interface Game {
  _id: GameId;
  players: UserId[];
  status: string;
}
```

**3. Querying Without Indexes**

```typescript
// ❌ BAD - no index, scans entire table
const games = await db.query('games').collect();
const userGames = games.filter(g => g.userId === userId);

// ✅ GOOD - uses index
const userGames = await db
  .query('games')
  .withIndex('userId', q => q.eq('userId', userId))
  .collect();
```

**4. Forgetting Authentication Checks**

```typescript
// ❌ BAD
export class DeleteDeckUseCase {
  async execute(input: DeleteDeckInput): Promise<void> {
    // Missing auth check!
    await this.ctx.deckRepo.delete(input.deckId);
  }
}

// ✅ GOOD
export class DeleteDeckUseCase {
  async execute(input: DeleteDeckInput): Promise<void> {
    ensureAuthenticated(this.ctx.session);
    // ... rest of logic
  }
}
```

**5. Not Using Branded ID Types**

```typescript
// ❌ BAD - primitive string
async getUser(id: string): Promise<User> {}

// ✅ GOOD - branded type
async getUser(id: UserId): Promise<User> {}
```

**6. Returning Raw Database Records**

```typescript
// ❌ BAD - exposes internal structure
return await db.get(deckId);

// ✅ GOOD - use mapper
const deck = await db.get(deckId);
return this.deckMapper.toDto(deck);
```

**7. Not Registering Subscribers as Eager**

```typescript
// ❌ BAD - subscriber won't initialize
[GameSubscribers.INJECTION_KEY]: {
  resolver: asClass(GameSubscribers)
}

// ✅ GOOD - eager initialization
[GameSubscribers.INJECTION_KEY]: {
  resolver: asClass(GameSubscribers),
  eager: true  // Critical!
}
```

**8. Multiple Parameters Instead of Config Object**

```typescript
// ❌ BAD - hard to read, hard to extend
constructor(
  id: GameId,
  player1: UserId,
  player2: UserId,
  status: string,
  createdAt: number
) {}

// ✅ GOOD - clear and extensible
constructor(config: {
  id: GameId;
  player1: UserId;
  player2: UserId;
  status: string;
  createdAt: number;
}) {}
```

**9. Wrong Error Types**

```typescript
// ❌ BAD - generic Error
throw new Error('Invalid email');

// ✅ GOOD - use AppError
throw new AppError('Invalid email');
```

**10. Not Updating Timestamps**

```typescript
// ❌ BAD - missing timestamp update
await db.patch(deckId, { name: newName });

// ✅ GOOD - include timestamp
await db.patch(deckId, {
  name: newName,
  updatedAt: Date.now()
});
```

---

## Implementation Templates

### Template: New Query Endpoint

```typescript
// Step 1: Define Use Case
// {domain}/usecases/{action}.usecase.ts
import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';

export interface {Action}Input {
  // Define input
}

export interface {Action}Output {
  // Define output (usually DTOs)
}

export class {Action}UseCase implements UseCase<{Action}Input, {Action}Output> {
  static INJECTION_KEY = '{action}UseCase' as const;

  constructor(
    protected ctx: {
      {entity}ReadRepo: {Entity}ReadRepository;
      {entity}Mapper: {Entity}Mapper;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: {Action}Input): Promise<{Action}Output> {
    ensureAuthenticated(this.ctx.session);

    // 1. Get data from repository
    const data = await this.ctx.{entity}ReadRepo.someMethod(input);

    // 2. Transform to DTOs
    return this.ctx.{entity}Mapper.toDtos(data);
  }
}

// Step 2: Register in providers
// {domain}/{domain}.providers.ts
export const queryDependencies = {
  [{Action}UseCase.INJECTION_KEY]: {
    resolver: asClass({Action}UseCase)
  }
};

// Step 3: Create endpoint
// convex/{domain-plural}.ts
export const {action} = queryWithContainer({
  args: {
    sessionId: v.string(),
    // other args
  },
  handler: async (container, args) => {
    const useCase = container.resolve<{Action}UseCase>(
      {Action}UseCase.INJECTION_KEY
    );
    return useCase.execute(args);
  }
});
```

### Template: New Mutation Endpoint

```typescript
// Step 1: Define Use Case
export class {Action}UseCase implements UseCase<{Action}Input, {Action}Output> {
  static INJECTION_KEY = '{action}UseCase' as const;

  constructor(
    protected ctx: {
      {entity}Repo: {Entity}Repository;
      eventEmitter: EventEmitter;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: {Action}Input): Promise<{Action}Output> {
    ensureAuthenticated(this.ctx.session);

    // 1. Validate/authorize
    // 2. Perform operation
    const result = await this.ctx.{entity}Repo.someMethod(input);

    // 3. Emit event if needed
    await this.ctx.eventEmitter.emit(
      SomethingHappenedEvent.EVENT_NAME,
      new SomethingHappenedEvent({ ... })
    );

    return result;
  }
}

// Step 2: Register in providers
export const mutationDependencies = {
  [{Action}UseCase.INJECTION_KEY]: {
    resolver: asClass({Action}UseCase)
  }
};

// Step 3: Create endpoint
export const {action} = mutationWithContainer({
  args: {
    sessionId: v.string(),
    // other args
  },
  handler: async (container, args) => {
    const useCase = container.resolve<{Action}UseCase>(
      {Action}UseCase.INJECTION_KEY
    );
    return useCase.execute(args);
  }
});
```

### Template: New Repository Method

```typescript
// Read repository method
export class {Entity}ReadRepository {
  static INJECTION_KEY = '{entity}ReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async {methodName}({params}): Promise<{Entity}[]> {
    return await this.ctx.db
      .query('{tableName}')
      .withIndex('{indexName}', q => q.eq('field', value))
      .collect();
  }
}

// Write repository method
export class {Entity}Repository {
  static INJECTION_KEY = '{entity}Repo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  async {methodName}({params}): Promise<{Entity}Id> {
    return await this.ctx.db.insert('{tableName}', {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }) as {Entity}Id;
  }

  async update(id: {Entity}Id, updates: Partial<{Entity}>): Promise<void> {
    await this.ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now()
    });
  }
}
```

### Template: New Event + Subscriber

```typescript
// Step 1: Define event
// {domain}/events/{event}.event.ts
export class {Event}Event {
  static EVENT_NAME = '{event}' as const;

  constructor(
    readonly data: {
      // Event payload
    }
  ) {}
}

// Step 2: Add to event map
// {domain}/{domain}.events.ts
export type {Domain}EventMap = {
  [{Event}Event.EVENT_NAME]: {Event}Event;
};

// Step 3: Create subscriber
// {otherDomain}/{otherDomain}.subscribers.ts
export class {Domain}Subscribers {
  static INJECTION_KEY = '{domain}Subscribers' as const;

  constructor(private ctx: {
    eventEmitter: EventEmitter;
    // other dependencies
  }) {
    this.ctx.eventEmitter.on(
      {Event}Event.EVENT_NAME,
      this.on{Event}.bind(this)
    );
  }

  private async on{Event}(event: {Event}Event): Promise<void> {
    // Handle event
  }
}

// Step 4: Register subscriber
export const mutationDependencies = {
  [{Domain}Subscribers.INJECTION_KEY]: {
    resolver: asClass({Domain}Subscribers),
    eager: true  // Critical!
  }
};

// Step 5: Emit event in use case
await this.ctx.eventEmitter.emit(
  {Event}Event.EVENT_NAME,
  new {Event}Event({ /* data */ })
);
```

### Template: New Guard

```typescript
// {domain}/{domain}.guards.ts
import { AppError } from '../utils/error';
import type { {Entity} } from './entities/{entity}.entity';
import type { UserId } from '../users/entities/user.entity';

export function ensure{Condition}(
  {entity}: {Entity},
  userId: UserId
): void {
  if (/* condition not met */) {
    throw new AppError('Error message');
  }
}

// Usage in use case
ensure{Condition}(entity, this.ctx.session.userId);
```

### Template: New Value Object

```typescript
// {domain}/{valueName}.ts
import { AppError } from '../utils/error';

export class {ValueName} {
  constructor(readonly value: string) {
    if (!value) {
      throw new AppError('{ValueName} is required');
    }

    if (/* invalid format */) {
      throw new AppError('Invalid {valueName} format');
    }

    // Normalize if needed
    this.value = value.toLowerCase();
  }

  equals(other: {ValueName}): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    try {
      new {ValueName}(value);
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## Pre-Implementation Checklist

Before starting ANY feature implementation:

- [ ] Read the user's request completely
- [ ] Identify which module(s) are affected
- [ ] Check if similar patterns exist in the codebase
- [ ] Determine if this is a query or mutation
- [ ] List all required dependencies
- [ ] Identify authorization requirements
- [ ] Plan event emissions (if any)
- [ ] Review existing schemas to understand data model
- [ ] Check for existing tests to understand patterns

---

## Post-Implementation Checklist

After completing implementation:

- [ ] All files follow naming conventions
- [ ] All files are in correct directories
- [ ] Dependencies registered in providers
- [ ] Types exported from `src/index.ts` (if public API)
- [ ] Authentication checks present (if required)
- [ ] Authorization guards used (if required)
- [ ] Events emitted (if needed)
- [ ] Subscribers registered with `eager: true` (if created)
- [ ] Timestamps included in create/update operations
- [ ] Indexes used for all queries
- [ ] Error handling with AppError
- [ ] Tests written (at minimum, use case tests)
- [ ] No business logic in API endpoints
- [ ] No repository imports in entities
- [ ] Config objects used for entity constructors
- [ ] Branded ID types used consistently

---

## Quick Diagnostic Questions

**If unsure where logic goes:**

- Is it a business rule? → Use Case
- Is it validation? → Value Object or Guard
- Is it data access? → Repository
- Is it authorization? → Guard
- Is it transformation? → Mapper

**If unsure about repository:**

- Does it read data? → ReadRepository
- Does it write data? → WriteRepository
- Does it need both? → Use separate repos

**If unsure about events:**

- Do multiple modules care? → Use event
- Is it critical to success? → Direct call
- Should it be async? → Use event

**If tests are failing:**

- Are all dependencies registered? Check providers
- Are subscribers eager? Check `eager: true`
- Are indexes defined? Check schemas
- Are types exported? Check `src/index.ts`

---

## Related Documentation

- [Architecture Overview](./01-architecture-overview.md) - System design
- [Common Tasks](./15-common-tasks.md) - Detailed examples
- [Module Guide](./14-module-guide.md) - Module specifics
- [Testing Guide](./13-testing-guide.md) - Testing patterns

---

## Remember

1. **Follow the order**: Schema → Entity → Repository → Use Case → Providers → Endpoint
2. **Check before creating**: Search for similar patterns first
3. **Use checklists**: Validate after each step
4. **Test as you go**: Don't wait until the end
5. **Keep it simple**: Don't over-engineer
6. **Follow conventions**: Consistency matters
7. **Think in layers**: API → Use Case → Repository → Database
8. **Separate concerns**: Each layer has one job
9. **Trust the patterns**: They're here for a reason
10. **When in doubt**: Look at existing code for examples
