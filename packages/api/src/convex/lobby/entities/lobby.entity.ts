import { isDefined } from '@game/shared';
import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import type { UserId } from '../../users/entities/user.entity';
import { DomainError } from '../../utils/error';
import { LOBBY_STATUS } from '../lobby.constants';

export type LobbyId = Id<'lobbies'>;
export type LobbyDoc = Doc<'lobbies'>;

export type LobbyMessage = {
  author: string;
  text: string;
};

export type LobbyOptions = {
  disableTurnTimers: boolean;
  teachingMode: boolean;
};

export class Lobby extends Entity<LobbyId, LobbyDoc> {
  get name() {
    return this.data.name;
  }

  get ownerId() {
    return this.data.ownerId;
  }

  get gameId() {
    return this.data.gameId;
  }

  get password() {
    return this.data.password;
  }

  get status() {
    return this.data.status;
  }

  get messages() {
    return this.data.messages;
  }

  get options() {
    return this.data.options;
  }

  get isPasswordProtected() {
    return isDefined(this.data.password) && this.data.password !== '';
  }

  get isWaitingForPlayers() {
    return this.data.status === LOBBY_STATUS.WAITING_FOR_PLAYERS;
  }

  get isCreatingGame() {
    return this.data.status === LOBBY_STATUS.CREATING_GAME;
  }

  get isOngoing() {
    return this.data.status === LOBBY_STATUS.ONGOING;
  }

  isOwner(userId: UserId): boolean {
    return this.data.ownerId === userId;
  }

  canJoin(): boolean {
    return this.isWaitingForPlayers;
  }

  canStartGame(): boolean {
    return this.isWaitingForPlayers;
  }

  validatePassword(password?: string): boolean {
    if (!this.isPasswordProtected) {
      return true;
    }
    return this.data.password === password;
  }

  startCreatingGame(): void {
    if (!this.canStartGame()) {
      throw new DomainError('Cannot start game creation in current lobby status');
    }

    this.data.status = LOBBY_STATUS.CREATING_GAME;
  }

  setGameStarted(gameId: Id<'games'>): void {
    if (!this.isCreatingGame) {
      throw new DomainError('Lobby must be in creating game status to set game started');
    }

    this.data.gameId = gameId;
    this.data.status = LOBBY_STATUS.ONGOING;
  }

  updateOptions(options: Partial<LobbyOptions>): void {
    this.data.options = { ...this.data.options, ...options };
  }
}
