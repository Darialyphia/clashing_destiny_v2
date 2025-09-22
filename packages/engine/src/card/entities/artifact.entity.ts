import type { Values } from '@game/shared';
import type { Game } from '../../game/game';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import { type ArtifactBlueprint, type PreResponseTarget } from '../card-blueprint';
import { ARTIFACT_KINDS, CARD_EVENTS, type ArtifactKind } from '../card.enums';
import {
  CardBeforePlayEvent,
  CardAfterPlayEvent,
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

export type SerializedArtifactCard = SerializedCard & {
  maxDurability: number;
  durability: number;
  subKind: ArtifactKind;
  manaCost: number;
  baseManaCost: number;
  abilities: string[];
};

export type ArtifactCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, ArtifactCard>;
  canUseAbility: Interceptable<
    boolean,
    { card: ArtifactCard; ability: Ability<ArtifactCard> }
  >;
  durability: Interceptable<number, ArtifactCard>;
  attackBonus: Interceptable<number, ArtifactCard>;
};

export const ARTIFACT_EVENTS = {
  ARTIFACT_BEFORE_LOSE_DURABILITY: 'artifact.lose-durability',
  ARTIFACT_AFTER_LOSE_DURABILITY: 'artifact.after-lose-durability',
  ARTIFACT_BEFORE_GAIN_DURABILITY: 'artifact.gain-durability',
  ARTIFACT_AFTER_GAIN_DURABILITY: 'artifact.after-gain-durability',
  ARTIFACT_EQUIPED: 'artifact.equiped'
} as const;

export type ArtifactEvents = Values<typeof ARTIFACT_EVENTS>;

export class ArtifactDurabilityEvent extends TypedSerializableEvent<
  { card: ArtifactCard; amount: number },
  { card: SerializedArtifactCard; amount: number }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      amount: this.data.amount
    };
  }
}

export class ArtifactEquipedEvent extends TypedSerializableEvent<
  { card: ArtifactCard },
  { card: SerializedArtifactCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export type ArtifactCardEventMap = {
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_LOSE_DURABILITY]: ArtifactDurabilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_LOSE_DURABILITY]: ArtifactDurabilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_GAIN_DURABILITY]: ArtifactDurabilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_GAIN_DURABILITY]: ArtifactDurabilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_EQUIPED]: ArtifactEquipedEvent;
};

export class ArtifactCard extends Card<
  SerializedCard,
  ArtifactCardInterceptors,
  ArtifactBlueprint
> {
  private lostDurability = 0;

  readonly abilityTargets = new Map<string, PreResponseTarget[]>();

  readonly abilities: Ability<ArtifactCard>[] = [];

  constructor(game: Game, player: Player, options: CardOptions<ArtifactBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canUseAbility: new Interceptable(),
        durability: new Interceptable(),
        attackBonus: new Interceptable()
      },
      options
    );

    this.blueprint.abilities.forEach(ability => {
      this.abilities.push(new Ability<ArtifactCard>(this.game, this, ability));
    });
  }

  get subkind() {
    return this.blueprint.subKind;
  }

  get maxDurability(): number {
    return this.interceptors.durability.getValue(this.blueprint.durability, this);
  }

  get remainingDurability(): number {
    return this.maxDurability - this.lostDurability;
  }

  removeFromCurrentLocation(): void {
    super.removeFromCurrentLocation();
    this.lostDurability = 0;
  }

  async checkDurability() {
    if (this.remainingDurability <= 0) {
      await this.player.artifactManager.unequip(this);
    }
  }

  async loseDurability(amount: number) {
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_BEFORE_LOSE_DURABILITY,
      new ArtifactDurabilityEvent({ card: this, amount })
    );

    this.lostDurability += Math.min(this.maxDurability, this.lostDurability + amount);
    await this.checkDurability();

    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_AFTER_LOSE_DURABILITY,
      new ArtifactDurabilityEvent({ card: this, amount })
    );
  }

  async gainDurability(amount: number) {
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_BEFORE_GAIN_DURABILITY,
      new ArtifactDurabilityEvent({ card: this, amount })
    );

    this.lostDurability = Math.max(0, this.lostDurability - amount);
    await this.checkDurability();

    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_AFTER_GAIN_DURABILITY,
      new ArtifactDurabilityEvent({ card: this, amount })
    );
  }

  get atkBonus(): number {
    return this.interceptors.attackBonus.getValue(
      this.blueprint.subKind === ARTIFACT_KINDS.WEAPON ? this.blueprint.atkBonus : 0,
      this
    );
  }

  canUseAbility(id: string) {
    const ability = this.abilities.find(ability => ability.abilityId === id);
    if (!ability) return false;

    return this.interceptors.canUseAbility.getValue(ability.canUse, {
      card: this,
      ability
    });
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

  async useAbility(id: string) {
    const ability = this.abilities.find(ability => ability.abilityId === id);
    if (!ability) return;

    return await ability.use();
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPlayBase && this.blueprint.canPlay(this.game, this),
      this
    );
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardDeclarePlayEvent({ card: this })
    );

    await this.insertInChainOrExecute(async () => {
      await this.player.artifactManager.equip(this);
      this.lostDurability = 0;
      await this.blueprint.onPlay(this.game, this);
      await this.game.emit(
        ARTIFACT_EVENTS.ARTIFACT_EQUIPED,
        new ArtifactEquipedEvent({ card: this })
      );
    }, []);
  }

  serialize(): SerializedArtifactCard {
    return {
      ...this.serializeBase(),
      maxDurability: this.maxDurability,
      durability: this.remainingDurability,
      subKind: this.subkind,
      manaCost: this.manaCost,
      baseManaCost: this.manaCost,
      abilities: this.abilities.map(a => a.id)
    };
  }
}
