import type { BetterExtract } from '@game/shared';
import type { CardLocation } from '../card/card.enums';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { Player } from './player.entity';
import type { PLAYER_EVENTS, Rune } from './player.enums';

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

export class PlayerRuneChangeEvent extends TypedSerializableEvent<
  { player: Player; gainedRunes: Rune[]; lostRunes: Rune[] },
  { player: string; gainedRunes: string[]; lostRunes: string[] }
> {
  serialize() {
    return {
      player: this.data.player.id,
      gainedRunes: this.data.gainedRunes,
      lostRunes: this.data.lostRunes
    };
  }
}

export class PlayerGainVictoryPointEvent extends TypedSerializableEvent<
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

export class PlayerWinBattlefieldRoundEvent extends TypedSerializableEvent<
  {
    player: Player;
    battlefield: BetterExtract<CardLocation, 'left_battlefield' | 'right_battlefield'>;
  },
  { player: string; battlefield: string }
> {
  serialize() {
    return {
      player: this.data.player.id,
      battlefield: this.data.battlefield
    };
  }
}

export type PlayerEventMap = {
  [PLAYER_EVENTS.PLAYER_BEFORE_DRAW]: PlayerDrawEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_DRAW]: PlayerDrawEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE]: PlayerManaChangeEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE]: PlayerManaChangeEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_RUNE_CHANGE]: PlayerRuneChangeEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_RUNE_CHANGE]: PlayerRuneChangeEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_GAIN_VICTORY_POINT]: PlayerGainVictoryPointEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_GAIN_VICTORY_POINT]: PlayerGainVictoryPointEvent;
  [PLAYER_EVENTS.PLAYER_WIN_BATTLEFIELD_ROUND]: PlayerWinBattlefieldRoundEvent;
};
