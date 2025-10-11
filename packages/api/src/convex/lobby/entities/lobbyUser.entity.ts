import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import type { UserId } from '../../users/entities/user.entity';
import { LOBBY_USER_ROLES } from '../lobby.constants';

export type LobbyUserId = Id<'lobbyUsers'>;
export type LobbyUserDoc = Doc<'lobbyUsers'>;

export class LobbyUser extends Entity<LobbyUserId, LobbyUserDoc> {
  get userId() {
    return this.data.userId;
  }

  get deckId() {
    return this.data.deckId;
  }

  get lobbyId() {
    return this.data.lobbyId;
  }

  get role() {
    return this.data.role;
  }

  get isPlayer() {
    return this.data.role === LOBBY_USER_ROLES.PLAYER;
  }

  get isSpectator() {
    return this.data.role === LOBBY_USER_ROLES.SPECTATOR;
  }

  isUser(userId: UserId): boolean {
    return this.data.userId === userId;
  }

  setDeck(deckId?: Id<'decks'>): void {
    this.data.deckId = deckId;
  }

  setRole(role: (typeof LOBBY_USER_ROLES)[keyof typeof LOBBY_USER_ROLES]): void {
    this.data.role = role;
  }
}
