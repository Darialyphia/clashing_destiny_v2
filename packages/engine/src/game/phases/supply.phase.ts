import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../game.enums';
import { RuneCard } from '../../card/entities/rune.entity';

export class SupplyPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  private async refillMana() {
    for (const player of this.game.playerSystem.players) {
      await player.manaManager.refill();
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
    await this.refillMana();
    await this.selectRune();

    await this.game.gamePhaseSystem.sendTransition(GAME_PHASE_TRANSITIONS.SUPPLIED_MANA);
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
