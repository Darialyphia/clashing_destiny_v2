import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../game.enums';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { AnyCard } from '../../card/entities/card.entity';

export class DrawPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  private async drawForTurn() {
    // both players draw at the same time, this lets the client animate all the cards together
    await this.game.emit(
      DRAW_PHASE_EVENTS.BEFORE_DRAW_FOR_TURN,
      new DrawPhaseDrawForTurnEvent({})
    );
    for (const player of this.game.playerSystem.players) {
      await player.cardManager.draw(player.cardsDrawnForTurn);
    }
    await this.game.emit(
      DRAW_PHASE_EVENTS.AFTER_DRAW_FOR_TURN,
      new DrawPhaseDrawForTurnEvent({})
    );
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
    // both players recollect at the same time, this lets the client animate all the cards together
    const cards = this.game.playerSystem.players.flatMap(player => [
      ...player.cardManager.supply
    ]);
    await this.game.emit(
      DRAW_PHASE_EVENTS.BEFORE_RECOLLECT_SUPPLY,
      new DrawPhaseRecollectSupplyEvent({ cards })
    );
    for (const player of this.game.playerSystem.players) {
      await player.recollectSupply();
    }
    await this.game.emit(
      DRAW_PHASE_EVENTS.AFTER_RECOLLECT_SUPPLY,
      new DrawPhaseRecollectSupplyEvent({ cards })
    );
  }

  private async rotateLocationCards() {
    if (!this.game.config.SHOULD_ROTATE_DESTINIES) return;
    // 1- remove card on right battlefield
    const rightCard =
      this.game.playerSystem.player1.boardSide.rightBattlefield.locationCard ??
      this.game.playerSystem.player2.boardSide.rightBattlefield.locationCard!;
    await rightCard!.removeFromCurrentLocation();
    await rightCard.player.cardManager.locationDeck.addToBottom(rightCard);

    // 2- move card on the left battlefield ro the right
    const leftCard = rightCard.player.opponent.boardSide.leftBattlefield.locationCard!;
    await leftCard.removeFromCurrentLocation();
    leftCard.player.boardSide.rightBattlefield.locationCard = leftCard;
    await leftCard.play();

    // 3- add a card to the left battlefield for the player who removed the right
    const newLeftCard = rightCard.player.cardManager.locationDeck.draw(1)[0];
    newLeftCard.player.boardSide.leftBattlefield.locationCard = newLeftCard;
    await newLeftCard.play();
  }

  private async setupLocationCards() {
    const initiativePlayer = this.game.turnSystem.initiativePlayer;
    const opponent = initiativePlayer.opponent;

    const leftLocation = initiativePlayer.cardManager.locationDeck.peek(1)[0];
    const rightLocation = opponent.cardManager.locationDeck.peek(1)[0];

    await leftLocation.removeFromCurrentLocation();
    initiativePlayer.boardSide.leftBattlefield.locationCard = leftLocation;
    await leftLocation.play();

    await rightLocation.removeFromCurrentLocation();
    opponent.boardSide.rightBattlefield.locationCard = rightLocation;
    await rightLocation.play();
  }

  async onEnter() {
    await this.game.turnSystem.startTurn();

    if (this.game.turnSystem.isFirstTurn) {
      await this.setupLocationCards();
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
      await this.rotateLocationCards();
      await this.recollectSupply();
      if (this.game.config.CARDS_MULLIGANED_PER_TURN > 0) {
        await this.mulligan(this.game.config.CARDS_MULLIGANED_PER_TURN, false);
      }
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

export const DRAW_PHASE_EVENTS = {
  BEFORE_RECOLLECT_SUPPLY: 'draw_phase_before_recollect_supply',
  AFTER_RECOLLECT_SUPPLY: 'draw_phase_after_recollect_supply',
  BEFORE_DRAW_FOR_TURN: 'draw_phase_before_draw_for_turn',
  AFTER_DRAW_FOR_TURN: 'draw_phase_after_draw_for_turn'
} as const;

export class DrawPhaseDrawForTurnEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class DrawPhaseRecollectSupplyEvent extends TypedSerializableEvent<
  { cards: AnyCard[] },
  { cards: string[] }
> {
  serialize() {
    return {
      cards: this.data.cards.map(card => card.id)
    };
  }
}

export type DrawPhaseEventMap = {
  [DRAW_PHASE_EVENTS.BEFORE_RECOLLECT_SUPPLY]: DrawPhaseRecollectSupplyEvent;
  [DRAW_PHASE_EVENTS.AFTER_RECOLLECT_SUPPLY]: DrawPhaseRecollectSupplyEvent;
  [DRAW_PHASE_EVENTS.BEFORE_DRAW_FOR_TURN]: DrawPhaseDrawForTurnEvent;
  [DRAW_PHASE_EVENTS.AFTER_DRAW_FOR_TURN]: DrawPhaseDrawForTurnEvent;
};
