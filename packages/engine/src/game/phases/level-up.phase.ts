import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { isDefined, type Serializable } from '@game/shared';

export type LevelUpSelection = {
  cardId: string | null; // null means skip
};

export type SerializedLevelUpPhase = {
  selections: Record<string, string | null>;
};

export class LevelUpPhase
  implements GamePhaseController, Serializable<SerializedLevelUpPhase>
{
  currentPlayer: Player;

  private selections = new Map<string, string | null>();

  constructor(private game: Game) {
    this.currentPlayer = game.turnSystem.initiativePlayer;
  }

  get isReady() {
    return this.game.playerSystem.players.every(p => this.selections.has(p.id));
  }

  hasPlayerSelected(player: Player): boolean {
    return this.selections.has(player.id);
  }

  getSelectionForPlayer(player: Player): string | null | undefined {
    return this.selections.get(player.id);
  }

  async selectDestinyCardForPlayer(player: Player, cardId: string | null) {
    if (this.selections.has(player.id)) return;

    // If a card is selected, validate it exists in the destiny deck
    if (cardId !== null) {
      const card = player.cardManager.destinyDeck.cards.find(c => c.id === cardId);
      if (!card) return;
    }

    this.selections.set(player.id, cardId);

    if (this.isReady) {
      await this.resolveSelections();
    }
  }

  async skipForPlayer(player: Player) {
    await this.selectDestinyCardForPlayer(player, null);
  }

  private async resolveSelections() {
    await this.game.gamePhaseSystem.commitLevelUp();

    const initiativePlayer = this.game.turnSystem.initiativePlayer;
    const orderedPlayers = [initiativePlayer, initiativePlayer.opponent];

    for (const player of orderedPlayers) {
      const cardId = this.selections.get(player.id);
      if (isDefined(cardId)) {
        const card = player.cardManager.destinyDeck.cards.find(c => c.id === cardId);
        if (card?.canPlay()) {
          await player.levelManager.levelUp(card);
        }
      }
    }
  }

  async onEnter() {
    if (this.game.turnSystem.elapsedTurns === 0) {
      await this.game.gamePhaseSystem.commitLevelUp();
    }
    this.selections.clear();
    for (const player of this.game.playerSystem.players) {
      if (!player.levelManager.canLevelup) {
        await this.skipForPlayer(player);
      }
    }
  }

  async onExit() {}

  serialize(): SerializedLevelUpPhase {
    const selections: Record<string, string | null> = {};
    for (const [playerId, cardId] of this.selections.entries()) {
      selections[playerId] = cardId ?? ('skip' as const);
    }
    this.game.playerSystem.players.forEach(p => {
      if (!selections[p.id]) {
        selections[p.id] = null;
      }
    });

    return { selections };
  }
}
