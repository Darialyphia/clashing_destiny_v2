import type { Nullable } from '@game/shared';
import type { CardReadRepository } from '../../card/repositories/card.repository';
import type { DeckReadRepository } from '../../deck/repositories/deck.repository';
import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import type { UserReadRepository } from '../../users/repositories/user.repository';
import { AppError } from '../../utils/error';
import type { GameId } from '../entities/game.entity';
import type { GamePlayerDoc, GamePlayerId } from '../entities/gamePlayer.entity';
import type { GameStatus } from '../game.constants';
import type { GameReadRepository } from '../repositories/game.repository';
import type { GamePlayerReadRepository } from '../repositories/gamePlayer.repository';

export type GetGameInfosInput = {
  gameId: GameId;
};

export type GetGameInfosOutput = {
  id: GameId;
  seed: string;
  winnerId: Nullable<UserId>;
  status: GameStatus;
  players: Array<{
    id: GamePlayerId;
    user: {
      id: UserId;
      username: string;
      deck: {
        spellSchools: string[];
        mainDeck: Array<{ blueprintId: string }>;
        destinyDeck: Array<{ blueprintId: string }>;
      };
    };
  }>;
  options: {
    disableTurnTimers: boolean;
    teachingMode: boolean;
  };
};
export class GetGameInfosUseCase
  implements UseCase<GetGameInfosInput, GetGameInfosOutput>
{
  static INJECTION_KEY = 'getGameInfosUsecase' as const;

  constructor(
    private ctx: {
      gameReadRepo: GameReadRepository;
      gamePlayerReadRepo: GamePlayerReadRepository;
      userReadRepo: UserReadRepository;
      deckReadRepo: DeckReadRepository;
      cardReadRepo: CardReadRepository;
    }
  ) {}

  async execute(input: GetGameInfosInput): Promise<GetGameInfosOutput> {
    const game = await this.validateAndFetchGame(input.gameId);
    const players = await this.fetchGamePlayers(input.gameId);
    const playersWithUserAndDeck = await this.buildPlayersWithUserAndDeck(players);

    return {
      id: game._id,
      seed: game.seed,
      players: playersWithUserAndDeck,
      winnerId: game.winnerId,
      status: game.status,
      options: game.options
    };
  }

  private async validateAndFetchGame(gameId: GameId) {
    const game = await this.ctx.gameReadRepo.getById(gameId);
    if (!game) throw new AppError('Game not found');
    return game;
  }

  private async fetchGamePlayers(gameId: GameId) {
    return await this.ctx.gamePlayerReadRepo.byGameId(gameId);
  }

  private async buildPlayersWithUserAndDeck(players: GamePlayerDoc[]) {
    return await Promise.all(
      players.map(async player => await this.buildPlayerWithUserAndDeck(player))
    );
  }

  private async buildPlayerWithUserAndDeck(player: GamePlayerDoc) {
    const user = await this.ctx.userReadRepo.getById(player.userId);
    if (!user) throw new AppError('User not found');

    const deck = await this.ctx.deckReadRepo.getById(player.deckId);
    if (!deck) throw new AppError('Deck not found');

    const mainDeckCards = await this.buildDeckCards(deck.mainDeck);
    const destinyDeckCards = await this.buildDeckCards(deck.destinyDeck);

    return {
      id: player._id,
      user: {
        id: user._id,
        username: user.username,
        deck: {
          spellSchools: deck.spellSchools,
          mainDeck: mainDeckCards,
          destinyDeck: destinyDeckCards
        }
      }
    };
  }

  private async buildDeckCards(deckCards: Array<{ cardId: any; copies: number }>) {
    const cardPromises = deckCards.map(async ({ cardId, copies }) => {
      const card = await this.ctx.cardReadRepo.getById(cardId);
      return Array.from({ length: copies }).map(() => ({
        blueprintId: card!.blueprintId
      }));
    });

    const cards = await Promise.all(cardPromises);
    return cards.flat();
  }
}
