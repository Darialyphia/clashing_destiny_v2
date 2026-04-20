import type { DestinyCard } from '../../card/entities/destiny-card.entity';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { type Serializable } from '@game/shared';

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
    // Get players in initiative order
    const initiativePlayer = this.game.turnSystem.initiativePlayer;
    const orderedPlayers = [
      initiativePlayer,
      ...this.game.playerSystem.players.filter(p => !p.equals(initiativePlayer))
    ];

    // Play destiny cards in initiative order
    for (const player of orderedPlayers) {
      const cardId = this.selections.get(player.id);
      if (cardId !== null && cardId !== undefined) {
        const card = player.cardManager.destinyDeck.cards.find(c => c.id === cardId) as
          | DestinyCard
          | undefined;
        if (card && card.canPlay()) {
          await player.levelManager.levelUp(card);
        }
      }
    }

    await this.game.gamePhaseSystem.commitLevelUp();
  }

  async onEnter() {
    for (const player of this.game.playerSystem.players) {
      if (!player.levelManager.canLevelup) {
        await this.skipForPlayer(player);
      }
    }
  }

  async onExit() {
    // Clear selections for next time
    this.selections.clear();
  }

  serialize(): SerializedLevelUpPhase {
    const selections: Record<string, string | null> = {};
    for (const [playerId, cardId] of this.selections.entries()) {
      selections[playerId] = cardId;
    }
    return { selections };
  }
}
