import type { AbilityBlueprint, ArtifactBlueprint } from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
import { CardPlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { AOE_TARGETING_TYPE } from '../../aoe/aoe-shape';
import {
  ARTIFACT_EVENTS,
  ArtifactDurabilityChangeEvent,
  ArtifactEquippedEvent
} from '../events/artifact.events';
import type { BoardSpace } from '../../board/board-space.entity';
import { AbilityManagerComponent } from '../components/abilities-manager.component';
import type { Ability } from './ability.entity';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SerializedArtifactCard = SerializedCard & {
  unplayableReason: string | null;
  manaCost: number;
  baseManaCost: number;
  maxDurability: number;
  remainingDurability: number;
  abilities: string[];
};

export type ArtifactCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, ArtifactCard>;
  maxDurability: Interceptable<number, ArtifactCard>;
  canUseAbility: Interceptable<
    boolean,
    { card: ArtifactCard; ability: Ability<ArtifactCard> }
  >;
};

export class ArtifactCard extends Card<
  SerializedArtifactCard,
  ArtifactCardInterceptors,
  ArtifactBlueprint
> {
  private lostDurability = 0;

  readonly abilityManager: AbilityManagerComponent<ArtifactCard>;

  constructor(game: Game, player: Player, options: CardOptions<ArtifactBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        maxDurability: new Interceptable(),
        canUseAbility: new Interceptable()
      },
      options
    );

    this.abilityManager = new AbilityManagerComponent<ArtifactCard>(game, this);
  }

  canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        this.hasUnlockedAffinity &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  canUseAbility(id: string) {
    const ability = this.abilityManager.getAbility(id);
    if (!ability) return false;

    return this.interceptors.canUseAbility.getValue(
      this.abilityManager.canUseAbility(id),
      {
        card: this,
        ability
      }
    );
  }

  addAbility(ability: AbilityBlueprint<ArtifactCard, any>) {
    return this.abilityManager.addAbility(ability);
  }

  removeAbility(abilityId: string) {
    this.abilityManager.removeAbility(abilityId);
  }

  get maxDurability(): number {
    return this.interceptors.maxDurability.getValue(this.blueprint.durability, this);
  }

  get remainingDurability(): number {
    return this.maxDurability - this.lostDurability;
  }

  get unplayableReason() {
    if (!this.canPayManaCost) {
      return "You don't have enough mana.";
    }

    return this.canPlay() ? null : 'You cannot play this card.';
  }

  async checkDurability() {
    if (this.remainingDurability <= 0) {
      await this.destroy(this);
    }
  }

  removeFromCurrentLocation(): void {
    super.removeFromCurrentLocation();
    this.lostDurability = 0;
  }

  get potentialPlayPositions() {
    return this.player.boardSide.base.filter(space => space.isEmpty);
  }

  private async selectPosition() {
    const result = await this.game.interaction.selectSpacesOnBoard({
      source: this,
      player: this.player,
      canCancel: true,
      getLabel: () => 'Select position to summon',
      isElligible: space => {
        return this.potentialPlayPositions.includes(space as any);
      },
      canCommit(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      isDone(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      timeoutFallback: [this.potentialPlayPositions[0]],
      getAOE: () =>
        new PointAOEShape(this.game, {
          targetingType: AOE_TARGETING_TYPE.EMPTY,
          player: this.player
        })
    });

    return result;
  }

  async loseDurability(amount: number) {
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_BEFORE_DURABILITY_CHANGE,
      new ArtifactDurabilityChangeEvent({ card: this, amount })
    );

    this.lostDurability += Math.min(this.maxDurability, this.lostDurability + amount);
    await this.checkDurability();

    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_AFTER_DURABILITY_CHANGE,
      new ArtifactDurabilityChangeEvent({ card: this, amount })
    );
  }

  async gainDurability(amount: number) {
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_BEFORE_DURABILITY_CHANGE,
      new ArtifactDurabilityChangeEvent({ card: this, amount: -amount })
    );

    this.lostDurability = Math.max(0, this.lostDurability - amount);
    await this.checkDurability();

    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_AFTER_DURABILITY_CHANGE,
      new ArtifactDurabilityChangeEvent({ card: this, amount: -amount })
    );
  }

  async playAt(position: BoardSpace) {
    await this.resolve(async () => {
      await this.equip(position);
    });
  }

  private async equip(position: BoardSpace) {
    this.player.boardSide.placeCardInBase(this, position.index);

    await this.blueprint.onPlay(this.game, this);

    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_EQUIPED,
      new ArtifactEquippedEvent({ card: this })
    );
  }

  // immediately plays the minion regardless of current chain or interaction state
  // doesnt trigger BEFORE_PLAY or AFTER_PLAY events
  // this is useful when summoning minions as part of another card effect
  playImmediatelyAt(position: BoardSpace) {
    return this.resolve(() => this.equip(position));
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardPlayEvent({ card: this })
    );
    const positionResult = await this.selectPosition();
    if (positionResult.cancelled) {
      return { cancelled: true };
    }
    await this.player.manaManager.spend(this.manaCost);
    await this.playAt(positionResult.result[0] as BoardSpace);

    return { cancelled: false };
  }

  serialize() {
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      baseManaCost: this.manaCost,
      maxDurability: this.maxDurability,
      remainingDurability: this.remainingDurability,
      unplayableReason: this.unplayableReason,
      abilities: this.abilityManager.serialize()
    };
  }
}
