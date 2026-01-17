# Authentication

## Overview

The API implements session-based authentication with secure password hashing and session management. Authentication is integrated through custom Convex wrappers that automatically inject session data.

## Authentication Flow

```
1. User registers/logs in
   ↓
2. Password is hashed (argon2)
   ↓
3. Session created in database
   ↓
4. Session ID returned to client
   ↓
5. Client sends sessionId with each request
   ↓
6. Session validated and injected into context
```

## Session Management

### Session Entity

```typescript
// auth/entities/session.entity.ts
export type AuthSession = Doc<'authSessions'>;
export type SessionId = AuthSession['_id'];

// Session structure
interface AuthSession {
  _id: SessionId;
  userId: UserId;
  expirationTime: number; // When session expires
  lastVerifiedTime: number; // Last activity
  _creationTime: number;
}
```

### Session Schema

```typescript
export const authSchemas = {
  authSessions: defineTable({
    userId: v.id('users'),
    expirationTime: v.number(),
    lastVerifiedTime: v.number()
  })
    .index('userId', ['userId'])
    .index('expirationTime', ['expirationTime'])
};
```

### Session Constants

```typescript
// auth/auth.constants.ts
export const DEFAULT_SESSION_TOTAL_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export const SESSION_VERIFICATION_INTERVAL_MS = 1000 * 60 * 60 * 24; // 24 hours

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
```

## Session Wrappers

### queryWithSession

Adds session to query context:

```typescript
export const queryWithSession = customQuery(query, {
  args: {
    sessionId: v.optional(v.union(v.null(), v.string()))
  },
  input: async (ctx, args: any) => {
    const sessionRepo = new SessionReadRepository({ db: ctx.db });
    const session = args.sessionId
      ? await sessionRepo.getValidSession(args.sessionId as SessionId)
      : null;
    return { ctx: { ...ctx, session }, args: {} };
  }
});
```

### mutationWithSession

Adds session to mutation context:

```typescript
export const mutationWithSession = customMutation(mutation, {
  args: {
    sessionId: v.optional(v.union(v.null(), v.string()))
  },
  input: async (ctx, args: any) => {
    const sessionRepo = new SessionRepository({ db: ctx.db });
    const session = args.sessionId
      ? await sessionRepo.getValidSession(args.sessionId as SessionId)
      : null;
    return { ctx: { ...ctx, session }, args: {} };
  }
});
```

## Authentication Guards

### ensureAuthenticated

Throws error if not authenticated:

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
export const create = mutationWithContainer({
  args: { name: v.string() },
  handler: async (container, args) => {
    const session = container.resolve<AuthSession | null>('session');
    ensureAuthenticated(session);

    // Now TypeScript knows session is not null
    const userId = session.userId;
  }
});
```

## Password Handling

### Password Value Object

```typescript
// utils/password.ts
export class Password {
  constructor(readonly value: string) {
    // Validate on construction
    if (value.length < PASSWORD_MIN_LENGTH) {
      throw new AppError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    }

    if (value.length > PASSWORD_MAX_LENGTH) {
      throw new AppError(`Password must be at most ${PASSWORD_MAX_LENGTH} characters`);
    }
  }

  async hash(): Promise<string> {
    return await hashPassword(this.value);
  }

  async verify(hashedPassword: string): Promise<boolean> {
    return await verifyPassword(hashedPassword, this.value);
  }
}
```

### Password Hashing

```typescript
import { hash, verify } from '@node-rs/argon2';

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });
}

export async function verifyPassword(
  hashedPassword: string,
  password: string
): Promise<boolean> {
  try {
    return await verify(hashedPassword, password);
  } catch {
    return false;
  }
}
```

## Email Validation

```typescript
// utils/email.ts
export class Email {
  constructor(readonly value: string) {
    if (!this.isValid(value)) {
      throw new AppError('Invalid email format');
    }
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

## Username Validation

```typescript
// users/username.ts
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

export class Username {
  constructor(readonly value: string) {
    if (value.length < USERNAME_MIN_LENGTH) {
      throw new AppError(`Username must be at least ${USERNAME_MIN_LENGTH} characters`);
    }

    if (value.length > USERNAME_MAX_LENGTH) {
      throw new AppError(`Username must be at most ${USERNAME_MAX_LENGTH} characters`);
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      throw new AppError('Username can only contain letters, numbers, and underscores');
    }
  }
}
```

## Authentication Use Cases

### Register Use Case

```typescript
export class RegisterUseCase {
  static INJECTION_KEY = 'registerUseCase' as const;

  constructor(
    protected ctx: {
      userRepo: UserRepository;
      sessionRepo: SessionRepository;
      eventEmitter: EventEmitter;
    }
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    // Validate email not taken
    const existing = await this.ctx.userRepo.getByEmail(input.email);
    if (existing) {
      throw new AppError('Email already in use');
    }

    // Hash password
    const hashedPassword = await input.password.hash();

    // Create user
    const userId = await this.ctx.userRepo.create({
      username: input.username,
      email: input.email,
      hashedPassword
    });

    // Emit event for side effects (grant starter deck, etc.)
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

### Login Use Case

```typescript
export class LoginUseCase {
  static INJECTION_KEY = 'loginUseCase' as const;

  constructor(
    protected ctx: {
      userRepo: UserRepository;
      sessionRepo: SessionRepository;
    }
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // Find user by email
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

### Logout Use Case

```typescript
export class LogoutUseCase {
  static INJECTION_KEY = 'logoutUseCase' as const;

  constructor(
    protected ctx: {
      session: AuthSession | null;
      sessionRepo: SessionRepository;
    }
  ) {}

  async execute(): Promise<void> {
    if (!this.ctx.session) {
      return; // Already logged out
    }

    // Delete session
    await this.ctx.sessionRepo.delete(this.ctx.session._id);
  }
}
```

### Get Current User Use Case

```typescript
export class GetSessionUserUseCase {
  static INJECTION_KEY = 'getSessionUserUseCase' as const;

  constructor(
    protected ctx: {
      session: AuthSession | null;
      userReadRepo: UserReadRepository;
      userMapper: UserMapper;
    }
  ) {}

  async execute(): Promise<UserDto> {
    ensureAuthenticated(this.ctx.session);

    const user = await this.ctx.userReadRepo.getById(this.ctx.session.userId);

    if (!user) {
      throw new AppError('User not found');
    }

    return this.ctx.userMapper.toDto(user);
  }
}
```

## API Endpoints

### Register

```typescript
export const register = mutationWithContainer({
  args: {
    email: v.string(),
    password: v.string(),
    username: v.string()
  },
  handler: async (container, input) => {
    const useCase = container.resolve<RegisterUseCase>(RegisterUseCase.INJECTION_KEY);

    const result = await useCase.execute({
      email: new Email(input.email),
      password: new Password(input.password),
      username: new Username(input.username)
    });

    return { sessionId: result.session._id };
  }
});
```

### Login

```typescript
export const login = mutationWithContainer({
  args: {
    email: v.string(),
    password: v.string()
  },
  handler: async (container, input) => {
    const useCase = container.resolve<LoginUseCase>(LoginUseCase.INJECTION_KEY);

    const result = await useCase.execute({
      email: new Email(input.email),
      password: new Password(input.password)
    });

    return { sessionId: result.session._id };
  }
});
```

### Logout

```typescript
export const logout = mutationWithContainer({
  args: {},
  handler: async container => {
    const useCase = container.resolve<LogoutUseCase>(LogoutUseCase.INJECTION_KEY);

    await useCase.execute();

    return { success: true };
  }
});
```

### Get Current User

```typescript
export const me = queryWithContainer({
  args: {},
  handler: async container => {
    ensureAuthenticated(container.resolve('session'));

    const useCase = container.resolve<GetSessionUserUseCase>(
      GetSessionUserUseCase.INJECTION_KEY
    );

    return useCase.execute();
  }
});
```

## Client Integration

### Auth Provider

```typescript
// packages/client/src/auth/AuthProvider.tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '@game/api';

export function AuthProvider({ children }) {
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem('sessionId')
  );

  const user = useQuery(api.auth.me,
    sessionId ? { sessionId } : 'skip'
  );

  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);

  const login = async (email: string, password: string) => {
    const { sessionId } = await loginMutation({
      email,
      password
    });
    localStorage.setItem('sessionId', sessionId);
    setSessionId(sessionId);
  };

  const logout = async () => {
    if (sessionId) {
      await logoutMutation({ sessionId });
    }
    localStorage.removeItem('sessionId');
    setSessionId(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, sessionId }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Protected Routes

```typescript
function ProtectedRoute({ children }) {
  const { user, sessionId } = useAuth();

  if (!sessionId) {
    return <Navigate to="/login" />;
  }

  if (user === undefined) {
    return <Loading />;
  }

  return children;
}
```

## Session Repository

```typescript
export class SessionRepository {
  static INJECTION_KEY = 'sessionRepo' as const;

  constructor(private ctx: { db: DatabaseWriter }) {}

  async create(userId: UserId): Promise<AuthSession> {
    const now = Date.now();
    const expirationTime = now + DEFAULT_SESSION_TOTAL_DURATION_MS;

    const sessionId = await this.ctx.db.insert('authSessions', {
      userId,
      expirationTime,
      lastVerifiedTime: now
    });

    const session = await this.ctx.db.get(sessionId);
    if (!session) {
      throw new AppError('Failed to create session');
    }

    return session;
  }

  async getValidSession(sessionId: SessionId): Promise<AuthSession | null> {
    const session = await this.ctx.db.get(sessionId);
    if (!session) return null;

    const now = Date.now();

    // Check if expired
    if (session.expirationTime < now) {
      await this.delete(sessionId);
      return null;
    }

    // Update last verified time if needed
    if (now - session.lastVerifiedTime > SESSION_VERIFICATION_INTERVAL_MS) {
      await this.updateLastVerified(sessionId);
    }

    return session;
  }

  async delete(sessionId: SessionId): Promise<void> {
    await this.ctx.db.delete(sessionId);
  }

  async deleteAllByUser(userId: UserId): Promise<void> {
    const sessions = await this.ctx.db
      .query('authSessions')
      .withIndex('userId', q => q.eq('userId', userId))
      .collect();

    await Promise.all(sessions.map(s => this.ctx.db.delete(s._id)));
  }

  private async updateLastVerified(sessionId: SessionId): Promise<void> {
    await this.ctx.db.patch(sessionId, {
      lastVerifiedTime: Date.now()
    });
  }
}
```

## Best Practices

### 1. Always Hash Passwords

```typescript
// Good
const hashedPassword = await password.hash();

// Bad: NEVER store plain text passwords
await db.insert('users', { password: plainPassword });
```

### 2. Use Value Objects for Validation

```typescript
// Good: Validation at boundary
new Email(input.email);
new Password(input.password);

// Bad: Manual validation everywhere
if (!input.email.includes('@')) {
}
```

### 3. Return Minimal Session Data

```typescript
// Good
return { sessionId: session._id };

// Bad: Don't expose sensitive data
return { session };
```

### 4. Check Session in Use Cases

```typescript
// Good
ensureAuthenticated(this.ctx.session);

// Bad: Assume session exists
const userId = this.ctx.session.userId; // May be null!
```

## Security Considerations

- Use argon2 for password hashing (not bcrypt or sha256)
- Set appropriate session expiration times
- Validate session on every request
- Clean up expired sessions periodically
- Don't expose password hashes to client
- Use HTTPS in production

## Next Steps

- Learn about [Guards and Authorization](./11-guards-and-authorization.md)
- Understand [Error Handling](./12-error-handling.md)
- See [Common Tasks](./15-common-tasks.md) for auth patterns
