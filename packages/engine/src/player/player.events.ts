import type { RuneCost } from '../card/card-blueprint';
import type { Rune } from '../card/card.enums';
import type { AnyCard } from '../card/entities/card.entity';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { Player, SerializedPlayer } from './player.entity';
import type { PLAYER_EVENTS } from './player.enums';

export class PlayerTurnEvent extends TypedSerializableEvent<
  { player: Player },
  { player: SerializedPlayer }
> {
  serialize() {
    return {
      player: this.data.player.serialize()
    };
  }
}

export class PlayerPayForDestinyCostEvent extends TypedSerializableEvent<
  { player: Player; cards: Array<{ card: AnyCard; index: number }> },
  { player: SerializedPlayer; cards: Array<{ card: string; index: number }> }
> {
  serialize() {
    return {
      player: this.data.player.serialize(),
      cards: this.data.cards.map(({ card, index }) => ({
        card: card.id,
        index
      }))
    };
  }
}

export class PlayerDrawEvent extends TypedSerializableEvent<
  { player: Player; amount: number },
  { player: SerializedPlayer; amount: number }
> {
  serialize() {
    return {
      player: this.data.player.serialize(),
      amount: this.data.amount
    };
  }
}

export class PlayerGainRuneEvent extends TypedSerializableEvent<
  { player: Player; rune: RuneCost },
  { player: string; rune: RuneCost }
> {
  serialize() {
    return {
      player: this.data.player.id,
      rune: this.data.rune
    };
  }
}

export class PlayerSpendRuneEvent extends TypedSerializableEvent<
  { player: Player; rune: RuneCost },
  { player: string; rune: RuneCost }
> {
  serialize() {
    return {
      player: this.data.player.id,
      rune: this.data.rune
    };
  }
}

export type PlayerEventMap = {
  [PLAYER_EVENTS.PLAYER_START_TURN]: PlayerTurnEvent;
  [PLAYER_EVENTS.PLAYER_END_TURN]: PlayerTurnEvent;
  [PLAYER_EVENTS.PLAYER_PAY_FOR_DESTINY_COST]: PlayerPayForDestinyCostEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_DRAW]: PlayerDrawEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_DRAW]: PlayerDrawEvent;
  [PLAYER_EVENTS.BEFORE_GAIN_RUNE]: PlayerGainRuneEvent;
  [PLAYER_EVENTS.AFTER_GAIN_RUNE]: PlayerGainRuneEvent;
  [PLAYER_EVENTS.BEFORE_SPEND_RUNE]: PlayerSpendRuneEvent;
  [PLAYER_EVENTS.AFTER_SPEND_RUNE]: PlayerSpendRuneEvent;
};
