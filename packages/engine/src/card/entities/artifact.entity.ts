import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import {
  type AbilityBlueprint,
  type ArtifactBlueprint,
  type Target
} from '../card-blueprint';
import {
  ARTIFACT_KINDS,
  CARD_EVENTS,
  CARD_SPEED,
  type ArtifactKind,
  type CardSpeed,
  type JobId
} from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent, CardPlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { Ability } from './ability.entity';
import {
  ARTIFACT_EVENTS,
  ArtifactDurabilityEvent,
  ArtifactEquipedEvent
} from '../events/artifact.events';
import { GAME_PHASES } from '../../game/game.enums';
import type { BoardSpace } from '../../board/board-space.entity';

export type SerializedArtifactCard = SerializedCard & {
  maxDurability: number;
  durability: number;
  subKind: ArtifactKind;
  manaCost: number;
  baseManaCost: number;
  abilities: string[];
  atkBonus: number | null;
  jobs: JobId[];
  speed: CardSpeed;
};

export type ArtifactCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, ArtifactCard>;
  canUseAbility: Interceptable<
    boolean,
    { card: ArtifactCard; ability: Ability<ArtifactCard> }
  >;
  durability: Interceptable<number, ArtifactCard>;
  attackBonus: Interceptable<number | null, ArtifactCard>;
  speed: Interceptable<CardSpeed, ArtifactCard>;
};

export class ArtifactCard extends Card<
  SerializedCard,
  ArtifactCardInterceptors,
  ArtifactBlueprint
> {
  private lostDurability = 0;

  readonly abilityTargets = new Map<string, Target[]>();

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
        attackBonus: new Interceptable(),
        speed: new Interceptable()
      },
      options
    );

    this.blueprint.abilities.forEach(ability => {
      this.abilities.push(
        new Ability<ArtifactCard>(this.game, this, {
          ...ability,
          onResolve: async (...args) => {
            await ability.onResolve(...args);
            await this.loseDurability(ability.durabilityCost);
          }
        })
      );
    });
  }

  get subkind() {
    return this.blueprint.subKind;
  }

  get speed(): CardSpeed {
    return this.interceptors.speed.getValue(this.blueprint.speed, this);
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

  isValidMovementPosition(): boolean {
    return false;
  }

  async checkDurability() {
    if (this.remainingDurability <= 0) {
      await this.destroy(this);
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

  get atkBonus(): number | null {
    return this.interceptors.attackBonus.getValue(
      this.blueprint.subKind === ARTIFACT_KINDS.WEAPON ? this.blueprint.atkBonus : null,
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

  addAbility(ability: AbilityBlueprint<ArtifactCard, Target>) {
    const newAbility = new Ability<ArtifactCard>(this.game, this, ability);
    this.abilities.push(newAbility);
    return newAbility;
  }

  removeAbility(abilityId: string) {
    const index = this.abilities.findIndex(a => a.abilityId === abilityId);
    if (index === -1) return;
    this.abilityTargets.delete(abilityId);
  }

  get isCorrectPhaseToPlay() {
    return this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN;
  }

  get jobs() {
    return this.blueprint.jobs;
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        this.hasUnlockedAffinity &&
        this.isCorrectPhaseToPlay &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  get potentialSummonPositions() {
    return []; // pending artifact rework
  }

  private async selectPosition() {
    const result = await this.game.interaction.selectSpacesOnBoard({
      source: this,
      player: this.player,
      canCancel: true,
      getLabel: () => 'Select position to summon',
      isElligible: space => {
        return false; // pending artifact rework
      },
      canCommit(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      isDone(selectedSpaces) {
        return selectedSpaces.length === 1;
      },
      timeoutFallback: [this.potentialSummonPositions[0]]
    });

    return result;
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );

    const positionResult = await this.selectPosition();
    if (positionResult.cancelled) return { cancelled: true };

    await this.game.emit(CARD_EVENTS.CARD_BEFORE_PLAY, new CardPlayEvent({ card: this }));

    this.lostDurability = 0;
    await this.blueprint.onPlay(this.game, this);
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_EQUIPED,
      new ArtifactEquipedEvent({
        card: this,
        position: positionResult.result[0] as BoardSpace
      })
    );
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );

    return { cancelled: false };
  }

  serialize(): SerializedArtifactCard {
    return {
      ...this.serializeBase(),
      maxDurability: this.maxDurability,
      durability: this.remainingDurability,
      subKind: this.subkind,
      manaCost: this.manaCost,
      baseManaCost: this.manaCost,
      abilities: this.abilities.map(a => a.id),
      atkBonus: this.atkBonus,
      jobs: this.jobs.map(job => job.id) as JobId[],
      speed: this.speed
    };
  }
}
