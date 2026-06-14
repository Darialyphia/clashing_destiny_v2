import type { Player } from '../../player/player.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { TURN_EVENTS } from '../game.enums';
import { System } from '../../system';

export type TurnEventMap = {
  [TURN_EVENTS.TURN_START]: TurnEvent;
  [TURN_EVENTS.TURN_END]: TurnEvent;
  [TURN_EVENTS.TURN_INITATIVE_CHANGE]: TurnInitiativeChangeEvent;
  [TURN_EVENTS.TURN_PASS]: TurnPassEvent;
};

export class TurnSystem extends System<never> {
  private _elapsedTurns = 0;

  // the initiative player is the one that can takestart an action
  private _initiativePlayer!: Player;

  private firstPlayerToPassThisRound: Player | null = null;

  async initialize() {
    // const idx = this.game.rngSystem.nextInt(this.game.playerSystem.players.length);
    this._initiativePlayer = this.game.playerSystem.player1;
    this.initiativePlayer.boardSide.leftBattlefield.destinyCard =
      this.initiativePlayer.cardManager.destinyDeck.draw(1)[0] ?? null;
    this.initiativePlayer.opponent.boardSide.rightBattlefield.destinyCard =
      this.initiativePlayer.opponent.cardManager.destinyDeck.draw(1)[0] ?? null;
  }

  shutdown() {}

  get initiativePlayer() {
    return this._initiativePlayer;
  }

  get elapsedTurns() {
    return this._elapsedTurns;
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
        left.destinyCard = player.cardManager.destinyDeck.draw(1)[0] ?? null;
      }

      if (hasLeft) {
        const card = left.destinyCard!;
        await card!.removeFromCurrentLocation();
        right.destinyCard = card;
        console.log(player.id, player.cardManager.destinyDeck.cards.length);
      }
    }
  }

  async startTurn() {
    await this.game.emit(
      TURN_EVENTS.TURN_START,
      new TurnEvent({ turnCount: this.elapsedTurns })
    );
    this._initiativePlayer = this.firstPlayerToPassThisRound ?? this.initiativePlayer;
    this.firstPlayerToPassThisRound = null;

    await this.game.emit(
      TURN_EVENTS.TURN_INITATIVE_CHANGE,
      new TurnInitiativeChangeEvent({ newInitiativePlayer: this._initiativePlayer })
    );

    await this.rotateDestinyCards();
  }

  endTurn() {
    this._elapsedTurns++;

    return this.game.emit(
      TURN_EVENTS.TURN_END,
      new TurnEvent({ turnCount: this.elapsedTurns })
    );
  }

  async pass(player: Player) {
    if (!player.equals(this._initiativePlayer)) return;
    await this.game.emit(
      TURN_EVENTS.TURN_PASS,
      new TurnPassEvent({ player: this._initiativePlayer })
    );
    player.passTurn();
    if (!this.firstPlayerToPassThisRound) {
      this.firstPlayerToPassThisRound = player;
    }
    const allPlayersPassed = this.game.playerSystem.players.every(
      p => p.hasPassedThisRound
    );
    if (allPlayersPassed) {
      await this.game.gamePhaseSystem.endTurn();
    } else {
      this._initiativePlayer = this._initiativePlayer.opponent;
      await this.game.emit(
        TURN_EVENTS.TURN_INITATIVE_CHANGE,
        new TurnInitiativeChangeEvent({ newInitiativePlayer: this._initiativePlayer })
      );
    }
  }

  async switchInitiative() {
    this._initiativePlayer = this._initiativePlayer.opponent;

    await this.game.emit(
      TURN_EVENTS.TURN_INITATIVE_CHANGE,
      new TurnInitiativeChangeEvent({ newInitiativePlayer: this._initiativePlayer })
    );
  }
}

export class TurnEvent extends TypedSerializableEvent<
  { turnCount: number },
  { turnCount: number }
> {
  serialize(): { turnCount: number } {
    return {
      turnCount: this.data.turnCount
    };
  }
}

export class TurnInitiativeChangeEvent extends TypedSerializableEvent<
  { newInitiativePlayer: Player },
  { newInitiativePlayer: string }
> {
  serialize() {
    return {
      newInitiativePlayer: this.data.newInitiativePlayer.id
    };
  }
}

export class TurnPassEvent extends TypedSerializableEvent<
  { player: Player },
  { player: string }
> {
  serialize() {
    return {
      player: this.data.player.id
    };
  }
}
