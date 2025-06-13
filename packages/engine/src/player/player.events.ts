import type { MainDeckCard } from '../board/board.system';
import type { Affinity } from '../card/card.enums';
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
  { player: Player; cards: Array<{ card: MainDeckCard; index: number }> },
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

export class PlayerUnlockAffinityEvent extends TypedSerializableEvent<
  { player: Player; affinity: Affinity },
  { player: SerializedPlayer; affinity: Affinity }
> {
  serialize() {
    return {
      player: this.data.player.serialize(),
      affinity: this.data.affinity
    };
  }
}

export type PlayerEventMap = {
  [PLAYER_EVENTS.PLAYER_START_TURN]: PlayerTurnEvent;
  [PLAYER_EVENTS.PLAYER_END_TURN]: PlayerTurnEvent;
  [PLAYER_EVENTS.PLAYER_PAY_FOR_DESTINY_COST]: PlayerPayForDestinyCostEvent;
  [PLAYER_EVENTS.PLAYER_UNLOCK_AFFINITY]: PlayerUnlockAffinityEvent;
};
