import type { MaybePromise } from '@game/shared';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { AbilityBlueprint, ArtifactBlueprint } from '../card-blueprint';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { CARD_EVENTS } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
import type { BoardCell } from '../../board/entities/board-cell.entity';
import { Ability } from './ability.entity';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SerializedArtifactCard = SerializedCard & {
  durability: number;
  manaCost: number;
  unplayableReason: string | null;
  abilities: string[];
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type ArtifactCardInterceptors = CardInterceptors & {
  durability: Interceptable<number>;
  canPlay: Interceptable<boolean, ArtifactCard>;
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
  readonly abilities: Ability<ArtifactCard>[];

  constructor(game: Game, player: Player, options: CardOptions<ArtifactBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        durability: new Interceptable(),
        canPlay: new Interceptable(),
        canUseAbility: new Interceptable()
      },
      options
    );
    this.abilities = options.blueprint.abilities.map(
      ability => new Ability(this.game, this as ArtifactCard, ability)
    );
  }

  get canAfford() {
    return this.player.canSpendMana(this.manaCost);
  }

  get artifact() {
    return this.player.artifactManager.artifacts.find(a => a.card.equals(this));
  }

  getAOE(targets: BoardCell[]) {
    return this.blueprint.getAoe(this.game, this, targets);
  }

  canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.canAfford && this.blueprint.canPlay(this.game, this),
      this
    );
  }

  get unplayableReason() {
    if (!this.canAfford) {
      return "You don't have enough mana.";
    }
    return this.canPlay() ? null : 'You cannot play this card.';
  }

  removeFromBoard(): Promise<void> {
    return this.player.artifactManager.unequip(this);
  }

  private async selectTargets() {
    return new Promise<
      { targets: BoardCell[]; cancelled: false } | { cancelled: true; targets?: never }
    >(
      // eslint-disable-next-line no-async-promise-executor
      async resolve => {
        this.cancelPlay = async () => {
          resolve({ cancelled: true });
          await this.game.interaction.getContext().ctx.cancel(this.player);
        };

        await this.removeFromCurrentLocation();

        const targets = await this.blueprint.getTargets(this.game, this);

        resolve({ targets, cancelled: false });
      }
    );
  }

  async play(onCancel: () => MaybePromise<void>) {
    const { targets, cancelled } = await this.selectTargets();
    await this.removeFromCurrentLocation();

    if (cancelled) {
      await onCancel();
      return;
    }

    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );

    const artifact = await this.player.artifactManager.equip(this)!;
    const aoe = this.blueprint.getAoe(this.game, this, targets);

    await this.blueprint.onPlay(this.game, this, {
      targets,
      aoe,
      artifact
    });

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  get durability(): number {
    return this.interceptors.durability.getValue(this.blueprint.durability, {});
  }

  getAbility(abilityId: string) {
    return this.abilities.find(ability => ability.abilityId === abilityId);
  }

  canUseAbility(id: string) {
    const ability = this.abilities.find(ability => ability.id === id);
    if (!ability) return false;

    return this.interceptors.canUseAbility.getValue(ability.canUse, {
      card: this,
      ability
    });
  }

  addAbility(ability: AbilityBlueprint<ArtifactCard>) {
    const newAbility = new Ability<ArtifactCard>(this.game, this, ability);
    this.abilities.push(newAbility);
    return newAbility;
  }

  removeAbility(abilityId: string) {
    const index = this.abilities.findIndex(a => a.id === abilityId);
    if (index === -1) return;
    this.abilities.splice(index, 1);
  }

  serialize() {
    return {
      ...this.serializeBase(),
      durability: this.durability,
      manaCost: this.manaCost,
      unplayableReason: this.unplayableReason,
      abilities: this.abilities.map(a => a.id)
    };
  }

  async useAbility(abilityId: string) {
    const ability = this.getAbility(abilityId);
    if (!ability) return;
    await ability.use();
    await this.artifact?.exhaust();
  }
}
