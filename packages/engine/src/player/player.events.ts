import type { BetterExtract } from '@game/shared';
import type { CardLocation } from '../card/card.enums';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { Player } from './player.entity';
import type { PLAYER_EVENTS } from './player.enums';
import type { AnyCard, SerializedCard } from '../card/entities/card.entity';

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

export class PlayerGainVictoryPointEvent extends TypedSerializableEvent<
  { player: Player; amount: number; total: number },
  { player: string; amount: number; total: number }
> {
  serialize() {
    return {
      player: this.data.player.id,
      amount: this.data.amount,
      total: this.data.total
    };
  }
}

export class PlayerAddSupplyEvent extends TypedSerializableEvent<
  { player: Player; card: AnyCard },
  { player: string; card: SerializedCard }
> {
  serialize() {
    return {
      player: this.data.player.id,
      card: this.data.card.serialize()
    };
  }
}

export class PlayerGainExpEvent extends TypedSerializableEvent<
  { player: Player; amount: number; total: number },
  { player: string; amount: number; total: number }
> {
  serialize() {
    return {
      player: this.data.player.id,
      amount: this.data.amount,
      total: this.data.total
    };
  }
}

export class PlayerLevelUpEvent extends TypedSerializableEvent<
  { player: Player; previousLevel: number; newLevel: number },
  { player: string; previousLevel: number; newLevel: number }
> {
  serialize() {
    return {
      player: this.data.player.id,
      previousLevel: this.data.previousLevel,
      newLevel: this.data.newLevel
    };
  }
}

export type PlayerEventMap = {
  [PLAYER_EVENTS.PLAYER_BEFORE_DRAW]: PlayerDrawEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_DRAW]: PlayerDrawEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE]: PlayerManaChangeEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE]: PlayerManaChangeEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_GAIN_VICTORY_POINT]: PlayerGainVictoryPointEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_GAIN_VICTORY_POINT]: PlayerGainVictoryPointEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_ADD_SUPPLY]: PlayerAddSupplyEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_ADD_SUPPLY]: PlayerAddSupplyEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_GAIN_EXP]: PlayerGainExpEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_GAIN_EXP]: PlayerGainExpEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_LEVEL_UP]: PlayerLevelUpEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_LEVEL_UP]: PlayerLevelUpEvent;
};
