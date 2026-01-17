# @game/api Documentation

Welcome to the API package documentation for the Clashing Destiny game. This package contains the backend logic built on [Convex](https://www.convex.dev/), implementing a clean architecture with dependency injection, use cases, and event-driven patterns.

## 📚 Table of Contents

1. [Architecture Overview](./01-architecture-overview.md) - System design and structure
2. [Dependency Injection](./02-dependency-injection.md) - Awilix container setup and patterns
3. [Use Case Pattern](./03-use-case-pattern.md) - Business logic organization
4. [Repository Pattern](./04-repository-pattern.md) - Data access layer
5. [Entities and Schemas](./05-entities-and-schemas.md) - Data models and Convex schemas
6. [API Endpoints](./06-api-endpoints.md) - Creating queries, mutations, and actions
7. [Authentication](./07-authentication.md) - Session-based auth system
8. [Event-Driven Architecture](./08-event-driven-architecture.md) - Domain events and subscribers
9. [Mappers](./09-mappers.md) - Data transformation layer
10. [Value Objects](./10-value-objects.md) - Type-safe domain primitives
11. [Guards and Authorization](./11-guards-and-authorization.md) - Access control patterns
12. [Error Handling](./12-error-handling.md) - Error management strategies
13. [Testing Guide](./13-testing-guide.md) - Testing approaches and examples
14. [Module Guide](./14-module-guide.md) - Deep dive into each module
15. [Common Tasks](./15-common-tasks.md) - Step-by-step tutorials
16. [Convex Integration](./16-convex-integration.md) - Convex-specific patterns

## 🚀 Quick Start

### Technology Stack

- **[Convex](https://www.convex.dev/)**: Backend-as-a-Service providing database, real-time updates, and serverless functions
- **[Awilix](https://github.com/jeffijoe/awilix)**: Dependency injection container
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development
- **[Zod](https://zod.dev/)**: Runtime type validation

### Package Structure

```
packages/api/
├── src/
│   ├── index.ts              # Public API exports
│   └── convex/               # Convex functions directory
│       ├── schema.ts         # Database schema definition
│       ├── auth.ts           # Auth API endpoints
│       ├── games.ts          # Game API endpoints
│       ├── decks.ts          # Deck management endpoints
│       ├── auth/             # Auth module
│       │   ├── auth.providers.ts
│       │   ├── entities/
│       │   ├── repositories/
│       │   ├── usecases/
│       │   └── ...
│       ├── game/             # Game module
│       ├── deck/             # Deck module
│       └── shared/           # Shared utilities
│           ├── container.ts  # DI container setup
│           └── eventEmitter.ts
```

### Key Concepts

- **Modules**: Domain-driven organization (auth, game, deck, lobby, etc.)
- **Use Cases**: Business logic encapsulation
- **Repositories**: Data access abstraction
- **Events**: Decoupled communication between modules
- **Container**: Dependency injection for testability and maintainability

## 🎯 Common Workflows

### Creating a New Feature

1. Define entity types and schema ([Guide](./05-entities-and-schemas.md))
2. Create repositories ([Guide](./04-repository-pattern.md))
3. Implement use cases ([Guide](./03-use-case-pattern.md))
4. Register dependencies ([Guide](./02-dependency-injection.md))
5. Create API endpoints ([Guide](./06-api-endpoints.md))
6. Add event handling if needed ([Guide](./08-event-driven-architecture.md))

See [Common Tasks](./15-common-tasks.md) for detailed step-by-step tutorials.

## 📖 Getting Started

1. **New to the codebase?** Start with [Architecture Overview](./01-architecture-overview.md)
2. **Adding a feature?** Check [Common Tasks](./15-common-tasks.md)
3. **Understanding a specific module?** See [Module Guide](./14-module-guide.md)
4. **Debugging an issue?** Review [Error Handling](./12-error-handling.md)

## 🔧 Development Commands

```bash
# Start Convex development server
npm run dev

# Generate TypeScript types from schema
npm run codegen

# Type checking
npm run type-check

# Deploy to production
npm run deploy
```

## 📝 Documentation Conventions

- **Code examples** are taken from the actual codebase
- **File paths** use absolute imports from `src/convex/`
- **Patterns** are explained with real-world use cases
- **Examples** show both correct usage and common pitfalls

## 🤝 Contributing

When adding new features, please:

1. Follow the established patterns documented here
2. Add appropriate tests
3. Update documentation if introducing new patterns
4. Emit domain events for significant state changes

## 📚 Additional Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Awilix Documentation](https://github.com/jeffijoe/awilix)
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
