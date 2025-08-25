import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { Email } from './utils/email';
import { Password } from './utils/password';

import { RegisterUseCase } from './auth/usecases/register.usecase';
import { LoginUseCase } from './auth/usecases/login.usecase';
import { ensureAuthenticated, mutationWithSession } from './auth/auth.utils';
import { LogoutUseCase } from './auth/usecases/logout.usecase';
import { createSessionRepository } from './auth/repositories/session.repository';
import { createUserRepository } from './users/user.repository';

export const register = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, input) => {
    const usecase = new RegisterUseCase({
      userRepo: createUserRepository(ctx.db),
      sessionRepo: createSessionRepository(ctx.db)
    });

    const result = await usecase.execute({
      email: new Email(input.email),
      password: new Password(input.password)
    });

    return { sessionId: result.session._id };
  }
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, input) => {
    const usecase = new LoginUseCase({
      userRepo: createUserRepository(ctx.db),
      sessionRepo: createSessionRepository(ctx.db)
    });

    const result = await usecase.execute({
      email: new Email(input.email),
      password: new Password(input.password)
    });

    return { sessionId: result.session._id };
  }
});

export const logout = mutationWithSession({
  args: {},
  handler: async ctx => {
    const usecase = new LogoutUseCase({
      sessionRepo: createSessionRepository(ctx.db)
    });

    await usecase.execute({
      sessionId: ensureAuthenticated(ctx.session)._id
    });

    return { success: true };
  }
});
