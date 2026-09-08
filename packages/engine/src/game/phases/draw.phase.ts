import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../game.enums';
import { RuneCard } from '../../card/entities/rune.entity';

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

  async selectRune() {
    const elligiblePlayers = this.game.playerSystem.players
      .filter(p => p.cardManager.runeDeck.size > 1)
      .map(player => {
        return {
          player,
          runes: player.cardManager.runeDeck.peek(2)
        };
      });

    const playersWithOnlyOneRune = this.game.playerSystem.players.filter(
      p => p.cardManager.runeDeck.size === 1
    );

    const result = await this.game.interaction.chooseCards<RuneCard, false>({
      canCancel: false,
      players: Object.fromEntries(
        elligiblePlayers.map(({ player, runes }) => [
          player.id,
          {
            choices: runes.map(card => ({
              card,
              aiHints: {
                shouldPick: () => 1
              }
            })),
            minChoiceCount: 1,
            maxChoiceCount: 1,
            label: `Choose a rune to play in the rune zone. The other will go at the bottom of the rune deck.`,
            timeoutFallback: []
          }
        ])
      )
    });

    for (const { player, cards } of Object.values(result.result)) {
      for (const card of cards) {
        await card.play();
      }
      const remainingCards = elligiblePlayers
        .find(p => p.player.equals(player))!
        .runes.filter(card => !cards.some(c => c.equals(card)));
      for (const card of remainingCards) {
        await card.sendToBottomOfDeck();
      }
    }

    for (const player of playersWithOnlyOneRune) {
      const card = player.cardManager.runeDeck.peek(1)[0];
      await card.play();
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
    await this.selectRune();

    await this.game.gamePhaseSystem.sendTransition(GAME_PHASE_TRANSITIONS.DRAWN_FOR_TURN);
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
