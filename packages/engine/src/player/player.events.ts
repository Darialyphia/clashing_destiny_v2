import type { RuneId } from '../card/card.enums';
import type { AnyCard } from '../card/entities/card.entity';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { Player, SerializedPlayer } from './player.entity';
import type { PLAYER_EVENTS } from './player.enums';

export class PlayerTurnEvent extends TypedSerializableEvent<
  { player: Player },
  { player: string }
> {
  serialize() {
    return {
      player: this.data.player.id
    };
  }
}

export class PlayerDrawEvent extends TypedSerializableEvent<
  { player: Player; amount: number },
  { player: string; amount: number }
> {
  serialize() {
    return {
      player: this.data.player.id,
      amount: this.data.amount
    };
  }
}

export class PlayerManaChangeEvent extends TypedSerializableEvent<
  { player: Player; amount: number },
  { player: string; amount: number }
> {
  serialize() {
    return {
      player: this.data.player.id,
      amount: this.data.amount
    };
  }
}

export class PlayerGainRuneEvent extends TypedSerializableEvent<
  { player: Player; runes: Partial<Record<RuneId, number>> },
  { player: string; runes: Partial<Record<RuneId, number>> }
> {
  serialize() {
    return {
      player: this.data.player.id,
      runes: this.data.runes
    };
  }
}

export class PlayerLoseRuneEvent extends TypedSerializableEvent<
  { player: Player; runes: Partial<Record<RuneId, number>> },
  { player: string; runes: Partial<Record<RuneId, number>> }
> {
  serialize() {
    return {
      player: this.data.player.id,
      runes: this.data.runes
    };
  }
}

export type PlayerEventMap = {
  [PLAYER_EVENTS.PLAYER_START_TURN]: PlayerTurnEvent;
  [PLAYER_EVENTS.PLAYER_END_TURN]: PlayerTurnEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_DRAW]: PlayerDrawEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_DRAW]: PlayerDrawEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE]: PlayerManaChangeEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE]: PlayerManaChangeEvent;
};
