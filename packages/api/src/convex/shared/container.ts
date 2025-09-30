import { asClass, asValue, createContainer, InjectionMode } from 'awilix';
import {
  SessionReadRepository,
  SessionRepository
} from '../auth/repositories/session.repository';
import { LoginUseCase } from '../auth/usecases/login.usecase';
import { LogoutUseCase } from '../auth/usecases/logout.usecase';
import { RegisterUseCase } from '../auth/usecases/register.usecase';
import { customMutation, customQuery } from 'convex-helpers/server/customFunctions';
import {
  internalMutationWithSession,
  internalQueryWithSession,
  mutationWithSession,
  queryWithSession,
  type MutationCtxWithSession,
  type QueryCtxWithSession
} from '../auth/auth.utils';

export const createQueryContainer = (ctx: QueryCtxWithSession) => {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY
  });

  container.register({
    db: asValue(ctx.db),
    session: asValue(ctx.session),
    [SessionReadRepository.INJECTION_KEY]: asClass(SessionReadRepository),
    [LoginUseCase.INJECTION_KEY]: asClass(LoginUseCase),
    [LogoutUseCase.INJECTION_KEY]: asClass(LogoutUseCase),
    [RegisterUseCase.INJECTION_KEY]: asClass(RegisterUseCase)
  });

  return container;
};

export const createMutationContainer = (ctx: MutationCtxWithSession) => {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY
  });

  container.register({
    db: asValue(ctx.db),
    session: asValue(ctx.session),
    scheduler: asValue(ctx.scheduler),
    [SessionRepository.INJECTION_KEY]: asClass(SessionRepository),
    [LoginUseCase.INJECTION_KEY]: asClass(LoginUseCase),
    [LogoutUseCase.INJECTION_KEY]: asClass(LogoutUseCase),
    [RegisterUseCase.INJECTION_KEY]: asClass(RegisterUseCase)
  });

  return container;
};

export const queryWithContainer = customQuery(queryWithSession, {
  args: {},
  input: async ctx => {
    const container = createQueryContainer(ctx as QueryCtxWithSession);
    return { ctx: { ...ctx, container }, args: {} };
  }
});

export const internalQueryWithContainer = customQuery(internalQueryWithSession, {
  args: {},
  input: async ctx => {
    const container = createQueryContainer(ctx as QueryCtxWithSession);
    return { ctx: { ...ctx, container }, args: {} };
  }
});

export const mutationWithContainer = customMutation(mutationWithSession, {
  args: {},
  input(ctx) {
    const container = createMutationContainer(ctx as MutationCtxWithSession);
    return { ctx: { ...ctx, container }, args: {} };
  }
});

export const internalMutationWithContainer = customMutation(internalMutationWithSession, {
  args: {},
  input(ctx) {
    const container = createMutationContainer(ctx as MutationCtxWithSession);
    return { ctx: { ...ctx, container }, args: {} };
  }
});
