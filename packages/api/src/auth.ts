import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { Email } from './utils/email';
import { Password } from './utils/password';

import { RegisterUseCase } from './auth/usecases/register.usecase';
import { LoginUseCase } from './auth/usecases/login.usecase';

export const register = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, input) => {
    const usecase = new RegisterUseCase(ctx);

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
    const usecase = new LoginUseCase(ctx);

    const result = await usecase.execute({
      email: new Email(input.email),
      password: new Password(input.password)
    });

    return { sessionId: result.session._id };
  }
});
