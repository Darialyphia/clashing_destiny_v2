// import { generatePasswordResetLinkUseCase } from './auth/usecases/generatePasswordResetLink.usecase';
// import { resetUserPasswordUsecase } from './auth/usecases/resetUserPassword.usecase';
// import { sendPasswordResetLinkUsecase } from './auth/usecases/sendPasswordResetLink.usecase';
// import { signinUsecase } from './auth/usecases/signin.usecase';
// import { signoffUsecase } from './auth/usecases/signoff.usecase';
// import { signupUsecase } from './auth/usecases/signup.usecase';
// import { validateSessionUsecase } from './auth/usecases/validateSession.usecase';

import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { Email } from './utils/email';
import { Password } from './utils/password';
import { AppError } from './utils/error';
import {
  DEFAULT_SESSION_TOTAL_DURATION_MS,
  DEFAULT_USERNAME
} from './auth/auth.constants';
import slugify from 'slugify';
import { generateDiscriminator } from './utils/discriminator';
import { createSession } from './auth/auth.utils';

// export const signIn = signinUsecase;
// export const signOff = signoffUsecase;
// export const signUp = signupUsecase;
// export const validateSession = validateSessionUsecase;
// export const sendPasswordResetLink = sendPasswordResetLinkUsecase;
// export const generatePasswordResetLink = generatePasswordResetLinkUseCase;
// export const resetPassword = resetUserPasswordUsecase;

export const register = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, input) => {
    const email = new Email(input.email);
    const password = new Password(input.password);

    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', email.value))
      .unique();
    if (existing) throw new AppError('Email already in use');

    const passwordHash = await password.toHash();

    const userId = await ctx.db.insert('users', {
      email: email.value,
      passwordHash,
      name: DEFAULT_USERNAME,
      slug: slugify(DEFAULT_USERNAME),
      discriminator: await generateDiscriminator(ctx, DEFAULT_USERNAME)
    });

    // also open a session so the client can proceed seamlessly
    const sessionId = await createSession(ctx, userId);

    return { sessionId };
  }
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, input) => {
    const email = new Email(input.email);
    const password = new Password(input.password);

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', email.value))
      .unique();

    // Avoid user-enumeration timing leaks by doing a fake hash compare on miss
    const hash = user?.passwordHash ?? (await new Password('dummy').toHash());

    const ok = await password.verify(hash);
    if (!user || !ok) throw new AppError('Invalid credentials');

    const sessionId = await createSession(ctx, user._id);

    return { sessionId };
  }
});
