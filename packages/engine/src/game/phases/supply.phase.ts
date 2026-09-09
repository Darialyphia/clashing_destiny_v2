import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../game.enums';
import { RuneCard } from '../../card/entities/rune.entity';
import type { Player } from '../../player/player.entity';

export class SupplyPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  private async refillMana() {
    for (const player of this.game.playerSystem.players) {
      await player.manaManager.refill();
    }
  }

  private async selectRuneFromRuneDeck(
    players: { player: Player; choices: RuneCard[] }[]
  ) {
    const result = await this.game.interaction.chooseCards<RuneCard, false>({
      canCancel: false,
      players: Object.fromEntries(
        players.map(({ player, choices: runes }) => [
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
      const remainingCards = players
        .find(p => p.player.equals(player))!
        .choices.filter(card => !cards.some(c => c.equals(card)));
      for (const card of remainingCards) {
        await card.sendToBottomOfDeck();
      }
    }
  }

  async gainRunes() {
    const playersWithManyRunes = this.game.playerSystem.players
      .filter(p => p.cardManager.runeDeck.size > 1)
      .map(player => {
        return {
          player,
          choices: player.cardManager.runeDeck.peek(2)
        };
      });
    const playersWithOnlyOneRune = this.game.playerSystem.players.filter(
      p => p.cardManager.runeDeck.size === 1
    );

    if (playersWithManyRunes.length > 0) {
      await this.selectRuneFromRuneDeck(playersWithManyRunes);
    }

    for (const player of playersWithOnlyOneRune) {
      const [card] = player.cardManager.runeDeck.peek(1);
      await card.play();
    }
  }

  async onEnter() {
    await this.refillMana();
    await this.gainRunes();

    await this.game.gamePhaseSystem.sendTransition(GAME_PHASE_TRANSITIONS.SUPPLIED_MANA);
    await this.game.snapshotSystem.takeSnapshot();
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
