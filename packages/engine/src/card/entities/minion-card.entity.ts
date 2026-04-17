import type { AbilityBlueprint, MinionBlueprint } from '../card-blueprint';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { MeleeTargetingStrategy } from '../../targeting/melee-targeting.straegy';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { Interceptable } from '../../utils/interceptable';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { CARD_EVENTS } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
import type { BoardCell } from '../../board/entities/board-cell.entity';
import {
  TARGETING_TYPE,
  type TargetingStrategy
} from '../../targeting/targeting-strategy';
import type { MaybePromise } from '@game/shared';
import {
  MINION_EVENTS,
  MinionAfterSummonedEvent,
  MinionBeforeSummonedEvent
} from '../events/minion.events';
import { SummoningSicknessModifier } from '../../modifier/modifiers/summoning-sickness.modifier';
import { Ability } from './ability.entity';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SerializedMinionCard = SerializedCard & {
  atk: number;
  maxHp: number;
  remainingHp: number;
  retaliation: number;
  manaCost: number;
  unplayableReason: string | null;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type MinionCardInterceptors = CardInterceptors & {
  atk: Interceptable<number>;
  maxHp: Interceptable<number>;
  retaliation: Interceptable<number>;
  summonTargetingStrategy: Interceptable<TargetingStrategy>;
  canPlay: Interceptable<boolean, MinionCard>;
  hasSummoningSickness: Interceptable<boolean, MinionCard>;
  canUseAbility: Interceptable<
    boolean,
    { card: MinionCard; ability: Ability<MinionCard> }
  >;
};

export class MinionCard extends Card<
  SerializedMinionCard,
  MinionCardInterceptors,
  MinionBlueprint
> {
  readonly abilities: Ability<MinionCard>[];

  constructor(game: Game, player: Player, options: CardOptions<MinionBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        retaliation: new Interceptable(),
        summonTargetingStrategy: new Interceptable(),
        canPlay: new Interceptable(),
        hasSummoningSickness: new Interceptable(),
        canUseAbility: new Interceptable()
      },
      options
    );
    this.abilities = options.blueprint.abilities.map(
      ability => new Ability(this.game, this as MinionCard, ability)
    );
  }

  get hasAvailablePosition() {
    return this.game.boardSystem.cells.some(
      cell => cell.player?.equals(this.player) && !cell.isOccupied
    );
  }

  get canAfford() {
    return this.player.canSpendMana(this.manaCost);
  }

  get hasSummoningSickness(): boolean {
    return this.interceptors.hasSummoningSickness.getValue(true, this);
  }

  canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.hasAvailablePosition &&
        this.canAfford &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  get unplayableReason() {
    if (!this.hasAvailablePosition) {
      return 'No available position to play this card.';
    }
    if (!this.canAfford) {
      return "You don't have enough mana.";
    }

    return this.canPlay() ? null : 'You cannot play this card.';
  }

  async removeFromBoard() {
    await this.unit.removeFromBoard();
  }

  async selectPosition() {
    return new Promise<
      { position: BoardCell; cancelled: false } | { cancelled: true; position?: never }
    >(
      // eslint-disable-next-line no-async-promise-executor
      async resolve => {
        let cancelled = false;
        this.cancelPlay = async () => {
          cancelled = true;
          await this.game.interaction.getContext().ctx.cancel(this.player);
          resolve({ cancelled: true });
        };

        const [position] = await this.game.interaction.selectSpacesOnBoard({
          player: this.player,
          source: this,
          getLabel: () => `Select position to summon ${this.blueprint.name}`,
          isElligible: cell => {
            return !!(cell.player?.equals(this.player) && !cell.isOccupied);
          },
          timeoutFallback: [
            this.game.boardSystem
              .getCellsForPlayer(this.player)
              .filter(cell => !cell.isOccupied)[0]
          ],
          canCommit(selectedSlots) {
            return selectedSlots.length === 1;
          },
          isDone(selectedSlots) {
            return selectedSlots.length === 1;
          },
          getAoe: () => new PointAOEShape(TARGETING_TYPE.ANYWHERE, {})
        });

        if (cancelled) return;
        resolve({ position, cancelled: false });
      }
    );
  }

  getAOE(position: BoardCell) {
    return new PointAOEShape(TARGETING_TYPE.ALLY_UNIT, {
      override: position
    });
  }

  async play(onCancel?: () => MaybePromise<void>) {
    const { position, cancelled } = await this.selectPosition();
    if (cancelled) return await onCancel?.();
    this.game.gamePhaseSystem.getContext<'playing_card_phase'>().ctx.closeCancelWindow();
    await this.playAt(position);
  }

  async playAt(position: BoardCell) {
    await this.removeFromCurrentLocation();
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );

    await this.game.emit(
      MINION_EVENTS.MINION_BEFORE_SUMMON,
      new MinionBeforeSummonedEvent({
        card: this,
        cell: position
      })
    );
    this.game.unitSystem.addUnit(this, position);

    if (this.hasSummoningSickness) {
      await this.unit.modifiers.add(new SummoningSicknessModifier(this.game, this));
      this.unit.exhaust();
    }

    await this.game.emit(
      MINION_EVENTS.MINION_AFTER_SUMMON,
      new MinionAfterSummonedEvent({
        card: this,
        unit: this.unit
      })
    );

    await this.blueprint.onPlay(this.game, this, {
      position
    });

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );

    this.spacesToHighlight = [];
  }

  serialize() {
    return {
      ...this.serializeBase(),
      atk: this.atk,
      retaliation: this.retaliation,
      maxHp: this.maxHp,
      remainingHp: this.unit?.remainingHp ?? 0,
      manaCost: this.manaCost,
      unplayableReason: this.unplayableReason
    };
  }

  get maxHp() {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, {});
  }

  get atk() {
    return this.interceptors.atk.getValue(this.blueprint.atk, {});
  }

  get retaliation() {
    return this.interceptors.retaliation.getValue(this.blueprint.retaliation, {});
  }

  get unit() {
    return this.game.unitSystem.units.find(unit => unit.card.equals(this))!;
  }

  get attackPattern() {
    return new MeleeTargetingStrategy(this.game, this.unit, this.unit.attackTargetType);
  }

  get attackAOEShape() {
    return new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {});
  }

  get counterattackPattern() {
    return new MeleeTargetingStrategy(
      this.game,
      this.unit,
      this.unit.counterattackTargetType
    );
  }

  get counterattackAOEShape() {
    return new PointAOEShape(TARGETING_TYPE.UNIT, {});
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

  addAbility(ability: AbilityBlueprint<MinionCard>) {
    const newAbility = new Ability<MinionCard>(this.game, this, ability);
    this.abilities.push(newAbility);
    return newAbility;
  }

  removeAbility(abilityId: string) {
    const index = this.abilities.findIndex(a => a.id === abilityId);
    if (index === -1) return;
    this.abilities.splice(index, 1);
  }

  async useAbility(abilityId: string) {
    const ability = this.getAbility(abilityId);
    if (!ability) return;
    await ability.use();
    await this.unit?.exhaust();
  }
}
