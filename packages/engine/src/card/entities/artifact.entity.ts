import type { Values } from '@game/shared';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import { type ArtifactBlueprint, type PreResponseTarget } from '../card-blueprint';
import { CARD_EVENTS, type ArtifactKind } from '../card.enums';
import { CardBeforePlayEvent, CardAfterPlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_PHASES } from '../../game/game.enums';
import { LoyaltyDamage } from '../../utils/damage';

export type SerializedArtifactCard = SerializedCard & {
  maxDurability: number;
  durability: number;
  subKind: ArtifactKind;
  manaCost: number;
  baseManaCost: number;
};

export type ArtifactCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, ArtifactCard>;
  durability: Interceptable<number, ArtifactCard>;
  attack: Interceptable<number, ArtifactCard>;
};

export const ARTIFACT_EVENTS = {
  ARTIFACT_BEFORE_USE_ABILITY: 'artifact.before-use-ability',
  ARTIFACT_AFTER_USE_ABILITY: 'artifact.after-use-ability',
  ARTIFACT_BEFORE_LOSE_DURABILITY: 'artifact.lose-durability',
  ARTIFACT_AFTER_LOSE_DURABILITY: 'artifact.after-lose-durability',
  ARTIFACT_BEFORE_GAIN_DURABILITY: 'artifact.gain-durability',
  ARTIFACT_AFTER_GAIN_DURABILITY: 'artifact.after-gain-durability',
  ARTIFACT_EQUIPED: 'artifact.equiped'
} as const;

export type ArtifactEvents = Values<typeof ARTIFACT_EVENTS>;

export class ArtifactUsedAbilityEvent extends TypedSerializableEvent<
  { card: ArtifactCard; abilityId: string },
  { card: SerializedArtifactCard; abilityId: string }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      abilityId: this.data.abilityId
    };
  }
}

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
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_USE_ABILITY]: ArtifactUsedAbilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_USE_ABILITY]: ArtifactUsedAbilityEvent;
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

  private abilityTargets = new Map<string, PreResponseTarget[]>();

  constructor(game: Game, player: Player, options: CardOptions<ArtifactBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        durability: new Interceptable(),
        attack: new Interceptable()
      },
      options
    );
  }

  get subkind() {
    return this.blueprint.subKind;
  }

  get atk(): number {
    if (this.subkind !== 'WEAPON') return 0;
    const base = (this.blueprint as ArtifactBlueprint & { subKind: 'WEAPON' }).atk;
    return this.interceptors.attack.getValue(base, this);
  }

  get maxDurability(): number {
    return this.interceptors.durability.getValue(this.blueprint.durability, this);
  }

  get remainingDurability(): number {
    return this.maxDurability - this.lostDurability;
  }

  async checkDurability() {
    if (this.remainingDurability <= 0) {
      await this.player.artifactManager.unequip(this.blueprint.subKind);
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

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        this.location === 'hand' &&
        this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN &&
        (this.hasAffinityMatch ? this.blueprint.canPlay(this.game, this) : true),
      this
    );
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    this.updatePlayedAt();
    this.removeFromCurrentLocation();

    if (!this.hasAffinityMatch) {
      await this.player.hero.takeDamage(this, new LoyaltyDamage(this));
    }
    this.player.artifactManager.equip(this);
    await this.blueprint.onPlay(this.game, this);
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_EQUIPED,
      new ArtifactEquipedEvent({ card: this })
    );

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  serialize(): SerializedArtifactCard {
    return {
      ...this.serializeBase(),
      maxDurability: this.maxDurability,
      durability: this.remainingDurability,
      subKind: this.subkind,
      manaCost: this.manaCost,
      baseManaCost: this.blueprint.manaCost
    };
  }
}
