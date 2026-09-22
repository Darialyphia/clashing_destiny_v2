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

  private async recollectSupply() {
    for (const player of this.game.playerSystem.players) {
      await player.recollectSupply();
    }
  }

  private async rotateDestinyCards() {
    for (const player of this.game.playerSystem.players) {
      const left = player.boardSide.leftBattlefield;
      const right = player.boardSide.rightBattlefield;

      const hasRight = !!right.destinyCard;
      const hasLeft = !!left.destinyCard;
      if (hasRight) {
        const card = right.destinyCard!;
        await right.destinyCard!.removeFromCurrentLocation();
        player.cardManager.destinyDeck.addToBottom(card);
        const newDestiny = player.cardManager.destinyDeck.peek(1)[0]!;
        left.destinyCard = newDestiny;
        await newDestiny.play();
      }

      if (hasLeft) {
        const card = left.destinyCard!;
        await card.removeFromCurrentLocation();
        right.destinyCard = card;
        await right.destinyCard.play();
      }
    }
  }

  private async setupDestinyCards() {
    const initiativePlayer = this.game.turnSystem.initiativePlayer;
    const opponent = initiativePlayer.opponent;

    const leftDestiny = initiativePlayer.cardManager.destinyDeck.peek(1)[0];
    const rightDestiny = opponent.cardManager.destinyDeck.peek(1)[0];

    await leftDestiny.removeFromCurrentLocation();
    initiativePlayer.boardSide.leftBattlefield.destinyCard = leftDestiny;
    await leftDestiny.play();

    await rightDestiny.removeFromCurrentLocation();
    opponent.boardSide.rightBattlefield.destinyCard = rightDestiny;
    await rightDestiny.play();
  }

  async onEnter() {
    await this.game.turnSystem.startTurn();

    if (this.game.turnSystem.isFirstTurn) {
      await this.setupDestinyCards();
      await this.drawForTurn();

      // this is in a setTimeout to not let the mulligan async interaction block game.initialize()
      setTimeout(async () => {
        if (this.game.config.START_OF_GAME_MULLIGANED_CARDS > 0) {
          await this.mulligan(this.game.config.START_OF_GAME_MULLIGANED_CARDS, true);
          await this.game.snapshotSystem.takeSnapshot();
          await this.game.gamePhaseSystem.sendTransition(
            GAME_PHASE_TRANSITIONS.DRAWN_FOR_TURN
          );
        } else {
          await this.game.snapshotSystem.takeSnapshot();
          await this.game.gamePhaseSystem.sendTransition(
            GAME_PHASE_TRANSITIONS.DRAWN_FOR_TURN
          );
        }
      });
    } else {
      await this.rotateDestinyCards();
      await this.recollectSupply();
      await this.mulligan(this.game.config.CARDS_MULLIGANED_PER_TURN, false);
      await this.drawForTurn();
      await this.game.gamePhaseSystem.sendTransition(
        GAME_PHASE_TRANSITIONS.DRAWN_FOR_TURN
      );
    }
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
