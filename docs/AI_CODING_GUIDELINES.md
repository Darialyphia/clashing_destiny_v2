# AI-Assisted Coding Guidelines

## General Guidelines

These guidelines apply to the whole repository

### TypeScript Specific

#### Modifier Order

- Use `declare protected` (not `protected declare`) to follow ESLint conventions

## API

The following guidelines apply for the `@game/api` package located at `/packages/api`

### Domain Entity Guidelines

#### Constructor Patterns

- **Use config objects** instead of multiple constructor parameters for domain entities
- This improves readability and makes it easier to add new properties

```typescript
// ✅ Good
class Matchmaking {
  constructor(config: {
    id: Id<"matchmaking">;
    name: string;
    startedAt: number;
    participants?: MatchmakingUser[];
    nextInvocationId?: Id<"_scheduled_functions">;
  }) {}
}

// ❌ Avoid
class Matchmaking {
  constructor(
    id: Id<"matchmaking">,
    name: string,
    startedAt: number,
    participants: MatchmakingUser[],
    nextInvocationId?: Id<"_scheduled_functions">
  ) {}
}
```

#### Method Naming

- **Use domain-specific method names** that a domain expert would understand
- Method names should reflect business operations, not technical operations

```typescript
// ✅ Good - Domain expert understands this
class Matchmaking {
  join(userId: Id<"users">): void {}
  leave(userId: Id<"users">): void {}
  cancel(): void {}
  start(): void {}
}

// ❌ Avoid - Too technical
class Matchmaking {
  addUser(userId: Id<"users">): void {}
  removeUser(userId: Id<"users">): void {}
  delete(): void {}
  execute(): void {}
}
```

### Repository Guidelines

#### Responsibility Separation

- **Domain entities**: Handle business rules within the aggregate
- **Repositories**: Handle persistence, cross-aggregate constraints, and data loading
- **Use case services**: Orchestrate complex workflows involving multiple aggregates

#### Error Handling

- Domain entities should throw `DomainError` for business rule violations
- Repositories should throw `AppError` for persistence/infrastructure issues

### General Clean Architecture Principles

#### File Organization

- Domain entities: `src/{domain}/entities/`
- Repositories: `src/{domain}/repositories/`
- Use cases: `src/{domain}/usecases/`
- Schemas: `src/{domain}/{domain}.schemas.ts`

#### Import Structure

- Domain entities should not import infrastructure concerns
- Repositories can import domain entities
- Use cases orchestrate between repositories and entities

#### Naming Conventions

- Domain entities: `{Entity}.entity.ts`
- Repositories: `{Entity}.repository.ts`
- Use cases: `{Action}.usecase.ts`
- Schemas: `{Domain}.schemas.ts`

#### Factory Functions

- Provide factory functions for repository instantiation
- Helps with dependency injection and testing

```typescript
export const createMatchmakingRepository = (db: DatabaseWriter) =>
  new MatchmakingRepository(db);
```
