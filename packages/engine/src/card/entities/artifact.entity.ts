import type { Values } from '@game/shared';
import type { Game } from '../../game/game';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { ArtifactBlueprint } from '../card-blueprint';
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

export type SerializedArtifactCard = SerializedCard & {
  maxDurability: number;
  durability: number;
  subKind: ArtifactKind;
  manaCost: number;
  abilities: Array<{
    id: string;
    canUse: boolean;
    name: string;
    description: string;
  }>;
};

export type ArtifactCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, ArtifactCard>;
  canUseAbility: Interceptable<boolean, ArtifactCard>;
  durability: Interceptable<number, ArtifactCard>;
  attack: Interceptable<number, ArtifactCard>;
};

export const ARTIFACT_EVENTS = {
  ARTIFACT_BEFORE_USE_ABILITY: 'artifact.before-use-ability',
  ARTIFACT_AFTER_USE_ABILITY: 'artifact.after-use-ability',
  ARTIFACT_BEFORE_LOSE_DURABILITY: 'artifact.lose-durability',
  ARTIFACT_AFTER_LOSE_DURABILITY: 'artifact.after-lose-durability',
  ARTIFACT_BEFORE_GAIN_DURABILITY: 'artifact.gain-durability',
  ARTIFACT_AFTER_GAIN_DURABILITY: 'artifact.after-gain-durability'
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

export type ArtifactCardEventMap = {
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_USE_ABILITY]: ArtifactUsedAbilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_USE_ABILITY]: ArtifactUsedAbilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_LOSE_DURABILITY]: ArtifactDurabilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_LOSE_DURABILITY]: ArtifactDurabilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_GAIN_DURABILITY]: ArtifactDurabilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_GAIN_DURABILITY]: ArtifactDurabilityEvent;
};

export class ArtifactCard extends Card<
  SerializedCard,
  ArtifactCardInterceptors,
  ArtifactBlueprint
> {
  private lostDurability = 0;

  constructor(game: Game, player: Player, options: CardOptions<ArtifactBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canUseAbility: new Interceptable(),
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

  canUseAbility(id: string) {
    const ability = this.blueprint.abilities.find(ability => ability.id === id);
    if (!ability) return false;
    return this.interceptors.canUseAbility.getValue(
      this.player.cardManager.hand.length >= ability.manaCost && ability.shouldExhaust
        ? !this.isExhausted
        : true && ability.canUse(this.game, this),
      this
    );
  }

  async useAbility(id: string) {
    const ability = this.blueprint.abilities.find(ability => ability.id === id);
    if (!ability) return;

    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_BEFORE_USE_ABILITY,
      new ArtifactUsedAbilityEvent({ card: this, abilityId: id })
    );
    const targets = await ability.getPreResponseTargets(this.game, this);
    if (ability.shouldExhaust) {
      await this.exhaust();
    }

    const effect = {
      source: this,
      handler: async () => {
        await ability.onResolve(this.game, this, targets);
        await this.game.emit(
          ARTIFACT_EVENTS.ARTIFACT_AFTER_USE_ABILITY,
          new ArtifactUsedAbilityEvent({ card: this, abilityId: id })
        );
      }
    };

    if (this.game.effectChainSystem.currentChain) {
      this.game.effectChainSystem.addEffect(effect, this.player);
    } else {
      void this.game.effectChainSystem.createChain(this.player, effect);
    }
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        !this.game.effectChainSystem.currentChain &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    this.player.artifactManager.equip(this);
    await this.blueprint.onPlay(this.game, this);
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
      manaCost: this.blueprint.manaCost,
      abilities: this.blueprint.abilities.map(ability => ({
        id: ability.id,
        canUse: this.canUseAbility(ability.id),
        name: ability.label,
        description: ability.description
      }))
    };
  }
}
