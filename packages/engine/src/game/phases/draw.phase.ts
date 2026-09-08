import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../game.enums';

export class DrawPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  private async drawForTurn() {
    for (const player of this.game.playerSystem.players) {
      await player.cardManager.draw(player.cardsDrawnForTurn);
    }
  }

  private async refillMana() {
    for (const player of this.game.playerSystem.players) {
      await player.manaManager.refill();
    }
  }

  private async mulligan(count: number, redraw: boolean) {
    const result = await this.game.interaction.chooseCards({
      canCancel: false,
      players: Object.fromEntries(
        this.game.playerSystem.players.map(p => [
          p.id,
          {
            choices: p.cardManager.hand.map(card => ({
              card,
              aiHints: {
                shouldPick: () => 1
              }
            })),
            minChoiceCount: 0,
            maxChoiceCount: count,
            label: `Choose up to ${count} cards to replace`,
            timeoutFallback: []
          }
        ])
      )
    });

    for (const { player, cards } of Object.values(result.result)) {
      for (const card of cards) {
        await card.sendToBottomOfDeck();
      }
      if (redraw) {
        await player.cardManager.draw(cards.length);
      }
    }
  }

  async onEnter() {
    await this.game.turnSystem.startTurn();

    if (this.game.turnSystem.isFirstTurn) {
      await this.drawForTurn();
      // this is in a setTimeout to not block game.initialize()
      setTimeout(async () => {
        await this.mulligan(this.game.config.START_OF_GAME_MULLIGANED_CARDS, true);
        await this.game.snapshotSystem.takeSnapshot();
      });
    } else {
      await this.mulligan(this.game.config.CARDS_MULLIGANED_PER_TURN, false);
      await this.drawForTurn();
    }
    await this.refillMana();

    await this.game.gamePhaseSystem.sendTransition(GAME_PHASE_TRANSITIONS.DRAWN_FOR_TURN);
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
