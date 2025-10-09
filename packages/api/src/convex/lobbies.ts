import { v } from 'convex/values';
import { CreateLobbyUseCase } from './lobby/usecases/createLobby.usecase';
import { JoinLobbyUseCase } from './lobby/usecases/joinLobby.usecase';
import { LeaveLobbyUseCase } from './lobby/usecases/leaveLobby.usecase';
import { SelectDeckForLobbyUseCase } from './lobby/usecases/selectDeckForLobby.usecase';
import { ChangeLobbyUserRoleUseCase } from './lobby/usecases/changeLobbyUserRole.usecase';
import { StartLobbyUseCase } from './lobby/usecases/startLobby.usecase';
import { mutationWithContainer } from './shared/container';

export const create = mutationWithContainer({
  args: {
    name: v.string(),
    password: v.optional(v.string())
  },
  async handler(ctx, args) {
    const usecase = ctx.resolve<CreateLobbyUseCase>(CreateLobbyUseCase.INJECTION_KEY);

    return usecase.execute({
      name: args.name,
      password: args.password
    });
  }
});

export const join = mutationWithContainer({
  args: {
    lobbyId: v.id('lobbies'),
    password: v.optional(v.string())
  },
  async handler(ctx, args) {
    const usecase = ctx.resolve<JoinLobbyUseCase>(JoinLobbyUseCase.INJECTION_KEY);

    return usecase.execute({
      lobbyId: args.lobbyId,
      password: args.password
    });
  }
});

export const leave = mutationWithContainer({
  args: {
    lobbyId: v.id('lobbies')
  },
  async handler(ctx, args) {
    const usecase = ctx.resolve<LeaveLobbyUseCase>(LeaveLobbyUseCase.INJECTION_KEY);

    return usecase.execute({
      lobbyId: args.lobbyId
    });
  }
});

export const selectDeck = mutationWithContainer({
  args: {
    lobbyId: v.id('lobbies'),
    deckId: v.id('decks')
  },
  async handler(ctx, args) {
    const usecase = ctx.resolve<SelectDeckForLobbyUseCase>(
      SelectDeckForLobbyUseCase.INJECTION_KEY
    );

    return usecase.execute({
      lobbyId: args.lobbyId,
      deckId: args.deckId
    });
  }
});

export const changeRole = mutationWithContainer({
  args: {
    lobbyId: v.id('lobbies'),
    targetUserId: v.id('users'),
    newRole: v.union(v.literal('PLAYER'), v.literal('SPECTATOR'))
  },
  async handler(ctx, args) {
    const usecase = ctx.resolve<ChangeLobbyUserRoleUseCase>(
      ChangeLobbyUserRoleUseCase.INJECTION_KEY
    );

    return usecase.execute({
      lobbyId: args.lobbyId,
      targetUserId: args.targetUserId,
      newRole: args.newRole
    });
  }
});

export const start = mutationWithContainer({
  args: {
    lobbyId: v.id('lobbies')
  },
  async handler(ctx, args) {
    const usecase = ctx.resolve<StartLobbyUseCase>(StartLobbyUseCase.INJECTION_KEY);

    return usecase.execute({
      lobbyId: args.lobbyId
    });
  }
});
