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

export type PlayerEventMap = {
  [PLAYER_EVENTS.PLAYER_START_TURN]: PlayerTurnEvent;
  [PLAYER_EVENTS.PLAYER_END_TURN]: PlayerTurnEvent;
};
