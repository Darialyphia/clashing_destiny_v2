import type { Values } from '@game/shared';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import {
  serializePreResponseTarget,
  type AbilityBlueprint,
  type DestinyBlueprint,
  type PreResponseTarget,
  type SerializedAbility
} from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
import {
  CardAfterPlayEvent,
  CardBeforePlayEvent,
  CardDeclarePlayEvent
} from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { Ability } from './ability.entity';

export type SerializedDestinyCard = SerializedCard & {
  minLevel: number;
  destinyCost: number;
  abilities: string[];
};
export type DestinyCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, DestinyCard>;
  abilities: Interceptable<Ability<DestinyCard>[], DestinyCard>;
};

export const DESTINY_EVENTS = {
  DESTINY_BEFORE_USE_ABILITY: 'destiny.before-use-ability',
  DESTINY_AFTER_USE_ABILITY: 'destiny.after-use-ability'
} as const;
export type DestinyEvents = Values<typeof DESTINY_EVENTS>;

export class DestinyUsedAbilityEvent extends TypedSerializableEvent<
  { card: DestinyCard; abilityId: string },
  { card: string; abilityId: string }
> {
  serialize() {
    return {
      card: this.data.card.id,
      abilityId: this.data.abilityId
    };
  }
}

export type DestinyCardEventMap = {
  [DESTINY_EVENTS.DESTINY_BEFORE_USE_ABILITY]: DestinyUsedAbilityEvent;
  [DESTINY_EVENTS.DESTINY_AFTER_USE_ABILITY]: DestinyUsedAbilityEvent;
};

export class DestinyCard extends Card<
  SerializedCard,
  DestinyCardInterceptors,
  DestinyBlueprint
> {
  readonly abilityTargets = new Map<string, PreResponseTarget[]>();

  constructor(game: Game, player: Player, options: CardOptions<DestinyBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        abilities: new Interceptable()
      },
      options
    );
  }

  get minLevel() {
    return this.blueprint.minLevel;
  }

  get countsAsLevel() {
    return this.blueprint.countsAsLevel;
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayDestinyCost &&
        this.minLevel <= this.player.hero.level &&
        this.interceptors.canPlay.getValue(true, this),
      this
    );
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardDeclarePlayEvent({ card: this })
    );
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    this.updatePlayedAt();
    this.removeFromCurrentLocation();
    await this.blueprint.onPlay(this.game, this);

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  get abilities(): Ability<DestinyCard>[] {
    return this.interceptors.abilities.getValue(
      this.blueprint.abilities.map(
        ability => new Ability<DestinyCard>(this.game, this, ability)
      ),
      this
    );
  }
  replaceAbilityTarget(abilityId: string, oldTarget: AnyCard, newTarget: AnyCard) {
    const targets = this.abilityTargets.get(abilityId);
    if (!targets) return;
    if (newTarget instanceof Card) {
      const index = targets.findIndex(t => t instanceof Card && t.equals(oldTarget));
      if (index === -1) return;

      const oldTarget = targets[index] as AnyCard;
      oldTarget.clearTargetedBy({ type: 'ability', abilityId, card: this });

      targets[index] = newTarget;
      newTarget.targetBy({ type: 'ability', abilityId, card: this });
    }
  }

  canUseAbility(id: string) {
    const ability = this.abilities.find(ability => ability.abilityId === id);
    if (!ability) return false;

    return ability.canUse;
  }

  async useAbility(id: string) {
    const ability = this.abilities.find(ability => ability.abilityId === id);
    if (!ability) return;

    return await ability.use();
  }

  serialize(): SerializedDestinyCard {
    return {
      ...this.serializeBase(),
      minLevel: this.minLevel,
      destinyCost: this.destinyCost,
      abilities: this.abilities.map(ability => ability.id)
    };
  }
}
