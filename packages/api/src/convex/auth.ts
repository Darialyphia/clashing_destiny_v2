import { v } from 'convex/values';
import { Email } from './utils/email';
import { Password } from './utils/password';

import { RegisterUseCase } from './auth/usecases/register.usecase';
import { LoginUseCase } from './auth/usecases/login.usecase';
import { LogoutUseCase } from './auth/usecases/logout.usecase';
import { mutationWithContainer, queryWithContainer } from './shared/container';
import { ensureAuthenticated } from './auth/auth.utils';
import { GetSessionUserUseCase } from './auth/usecases/getSessionUser.usecase';
import { Username } from './users/username';

export const register = mutationWithContainer({
  args: { email: v.string(), password: v.string(), username: v.string() },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<RegisterUseCase>(RegisterUseCase.INJECTION_KEY);
    const result = await usecase.execute({
      email: new Email(input.email),
      password: new Password(input.password),
      username: new Username(input.username)
    });

    return { sessionId: result.session._id };
  }
});

export const login = mutationWithContainer({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, input) => {
    const usecase = ctx.resolve<LoginUseCase>(LoginUseCase.INJECTION_KEY);

    const result = await usecase.execute({
      email: new Email(input.email),
      password: new Password(input.password)
    });

    return { sessionId: result.session._id };
  }
});

export const logout = mutationWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<LogoutUseCase>(LogoutUseCase.INJECTION_KEY);

    await usecase.execute();

    return { success: true };
  }
});

export const me = queryWithContainer({
  args: {},
  handler: async ctx => {
    ensureAuthenticated(ctx.resolve('session'));

    const usecase = ctx.resolve<GetSessionUserUseCase>(
      GetSessionUserUseCase.INJECTION_KEY
    );

    return usecase.execute();
  }
});
