import type { Rune } from '../card/card.enums';
import type { DeckCard } from '../card/components/card-manager.component';
import type { AnyCard } from '../card/entities/card.entity';
import type { Damage } from '../utils/damage';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { Player, ResourceAction, SerializedPlayer } from './player.entity';
import type { PLAYER_EVENTS } from './player.enums';

export class PlayerBeforeDrawEvent extends TypedSerializableEvent<
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

export class PlayerAfterDrawEvent extends TypedSerializableEvent<
  { player: Player; cards: DeckCard[] },
  { player: SerializedPlayer; cards: string[] }
> {
  serialize() {
    return {
      player: this.data.player.serialize(),
      cards: this.data.cards.map(card => card.id)
    };
  }
}

export class PlayerPlayCardEvent extends TypedSerializableEvent<
  { player: Player; card: DeckCard },
  { player: string; card: string }
> {
  serialize() {
    return {
      player: this.data.player.id,
      card: this.data.card.id
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
  { player: Player; runes: Partial<Record<Rune, number>> },
  { player: string; runes: Partial<Record<Rune, number>> }
> {
  serialize() {
    return {
      player: this.data.player.id,
      runes: this.data.runes
    };
  }
}

export class PlayerLoseRuneEvent extends TypedSerializableEvent<
  { player: Player; runes: Partial<Record<Rune, number>> },
  { player: string; runes: Partial<Record<Rune, number>> }
> {
  serialize() {
    return {
      player: this.data.player.id,
      runes: this.data.runes
    };
  }
}

export class PlayerResourceActionEvent extends TypedSerializableEvent<
  { player: Player; action: ResourceAction },
  { player: string; action: ResourceAction }
> {
  serialize() {
    return {
      player: this.data.player.id,
      action: this.data.action
    };
  }
}

export class PlayerDamageEvent extends TypedSerializableEvent<
  { player: Player; from: AnyCard; damage: Damage },
  { player: string; amount: number; from: string }
> {
  serialize() {
    return {
      player: this.data.player.id,
      amount: this.data.damage.getFinalAmount(this.data.player),
      from: this.data.from.id
    };
  }
}

export class PlayerHealEvent extends TypedSerializableEvent<
  { player: Player; amount: number; source: AnyCard },
  { player: string; amount: number; source: string }
> {
  serialize() {
    return {
      player: this.data.player.id,
      amount: this.data.amount,
      source: this.data.source.id
    };
  }
}

export class PlayerLevelUpEvent extends TypedSerializableEvent<
  { player: Player; newLevel: number },
  { player: string; newLevel: number }
> {
  serialize() {
    return {
      player: this.data.player.id,
      newLevel: this.data.newLevel
    };
  }
}

export class PlayerGainExpEvent extends TypedSerializableEvent<
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

export type PlayerEventMap = {
  [PLAYER_EVENTS.PLAYER_BEFORE_DRAW]: PlayerBeforeDrawEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_DRAW]: PlayerAfterDrawEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_PLAY_CARD]: PlayerPlayCardEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_PLAY_CARD]: PlayerPlayCardEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_MANA_CHANGE]: PlayerManaChangeEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_MANA_CHANGE]: PlayerManaChangeEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_GAIN_RUNE]: PlayerGainRuneEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_GAIN_RUNE]: PlayerGainRuneEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_LOSE_RUNE]: PlayerLoseRuneEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_LOSE_RUNE]: PlayerLoseRuneEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_PERFORM_RESOURCE_ACTION]: PlayerResourceActionEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_PERFORM_RESOURCE_ACTION]: PlayerResourceActionEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_TAKE_DAMAGE]: PlayerDamageEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_TAKE_DAMAGE]: PlayerDamageEvent;
  [PLAYER_EVENTS.PLAYER_BEFORE_HEAL]: PlayerHealEvent;
  [PLAYER_EVENTS.PLAYER_AFTER_HEAL]: PlayerHealEvent;
  [PLAYER_EVENTS.PLAYER_LEVEL_UP]: PlayerLevelUpEvent;
  [PLAYER_EVENTS.PLAYER_GAIN_EXP]: PlayerGainExpEvent;
};
