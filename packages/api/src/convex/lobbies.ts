import { v } from 'convex/values';
import { CreateLobbyUseCase } from './lobby/usecases/createLobby.usecase';
import { JoinLobbyUseCase } from './lobby/usecases/joinLobby.usecase';
import { LeaveLobbyUseCase } from './lobby/usecases/leaveLobby.usecase';
import { SelectDeckForLobbyUseCase } from './lobby/usecases/selectDeckForLobby.usecase';
import { ChangeLobbyUserRoleUseCase } from './lobby/usecases/changeLobbyUserRole.usecase';
import { StartLobbyUseCase } from './lobby/usecases/startLobby.usecase';
import { GetLobbyByIdUseCase } from './lobby/usecases/getLobbyById.usecase';
import { GetAllLobbiesUseCase } from './lobby/usecases/getAllLobbies.usecase';
import {
  internalMutationWithContainer,
  mutationWithContainer,
  queryWithContainer
} from './shared/container';
import { SetupLobbyGameUseCase } from './lobby/usecases/setupLobbyGame';
import { DeleteLobbyUseCase } from './lobby/usecases/deleteLobby.usecase';
import { UpdateLobbyOptionsUseCase } from './lobby/usecases/updateLobbyOptions.usecase';
import { KickFromLobbyUseCase } from './lobby/usecases/kickFromLobby.usecase';

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
    deckId: v.optional(v.id('decks'))
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

export const byId = queryWithContainer({
  args: {
    lobbyId: v.id('lobbies')
  },
  async handler(ctx, args) {
    const usecase = ctx.resolve<GetLobbyByIdUseCase>(GetLobbyByIdUseCase.INJECTION_KEY);

    return usecase.execute({
      lobbyId: args.lobbyId
    });
  }
});

export const list = queryWithContainer({
  args: {},
  async handler(ctx) {
    const usecase = ctx.resolve<GetAllLobbiesUseCase>(GetAllLobbiesUseCase.INJECTION_KEY);

    return usecase.execute();
  }
});

export const updateOptions = mutationWithContainer({
  args: {
    lobbyId: v.id('lobbies'),
    options: v.object({
      disableTurnTimers: v.boolean(),
      teachingMode: v.boolean()
    })
  },
  async handler(ctx, args) {
    const usecase = ctx.resolve<UpdateLobbyOptionsUseCase>(
      UpdateLobbyOptionsUseCase.INJECTION_KEY
    );

    return usecase.execute({
      lobbyId: args.lobbyId,
      options: args.options
    });
  }
});

export const setupLobbyGame = internalMutationWithContainer({
  args: {
    lobbyId: v.id('lobbies')
  },
  async handler(ctx, args) {
    const usecase = ctx.resolve<SetupLobbyGameUseCase>(
      SetupLobbyGameUseCase.INJECTION_KEY
    );

    return usecase.execute({
      lobbyId: args.lobbyId
    });
  }
});

export const destroy = internalMutationWithContainer({
  args: {
    lobbyId: v.id('lobbies')
  },
  async handler(ctx, args) {
    const usecase = ctx.resolve<DeleteLobbyUseCase>(DeleteLobbyUseCase.INJECTION_KEY);

    return usecase.execute({
      lobbyId: args.lobbyId
    });
  }
});

export const kick = internalMutationWithContainer({
  args: {
    userId: v.id('users')
  },
  async handler(ctx, args) {
    const usecase = ctx.resolve<KickFromLobbyUseCase>(KickFromLobbyUseCase.INJECTION_KEY);

    return usecase.execute({
      userId: args.userId
    });
  }
});
