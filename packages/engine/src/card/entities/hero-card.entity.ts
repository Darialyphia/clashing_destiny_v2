import type { AbilityBlueprint, HeroBlueprint } from '../card-blueprint';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { Interceptable } from '../../utils/interceptable';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { TARGETING_TYPE } from '../../targeting/targeting-strategy';
import { AnywhereTargetingStrategy } from '../../targeting/anywhere-targeting-strategy';
import { Ability } from './ability.entity';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SerializedHeroCard = SerializedCard & {
  atk: number;
  maxHp: number;
  retaliation: number;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type HeroCardInterceptors = CardInterceptors & {
  atk: Interceptable<number>;
  maxHp: Interceptable<number>;
  retaliation: Interceptable<number>;
  canUseAbility: Interceptable<boolean, { card: HeroCard; ability: Ability<HeroCard> }>;
};

export class HeroCard extends Card<
  SerializedHeroCard,
  HeroCardInterceptors,
  HeroBlueprint
> {
  readonly abilities: Ability<HeroCard>[];

  private _isExhausted = false;

  constructor(game: Game, player: Player, options: CardOptions<HeroBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        retaliation: new Interceptable(),
        canUseAbility: new Interceptable()
      },
      options
    );

    this.abilities = options.blueprint.abilities.map(
      ability => new Ability(this.game, this as HeroCard, ability)
    );
  }

  canPlay() {
    return true;
  }

  exhaust() {
    this._isExhausted = true;
  }

  wakeUp() {
    this._isExhausted = false;
  }

  get isExhausted() {
    return this._isExhausted;
  }

  async play() {
    this.game.gamePhaseSystem.getContext<'playing_card_phase'>().ctx.closeCancelWindow();
    await this.blueprint.onPlay(this.game, this);
  }

  removeFromBoard(): Promise<void> {
    return Promise.resolve();
  }

  serialize() {
    return {
      ...this.serializeBase(),
      atk: this.atk,
      retaliation: this.retaliation,
      maxHp: this.maxHp
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

  get attackPattern() {
    return new AnywhereTargetingStrategy(
      this.game,
      this.player,
      TARGETING_TYPE.ENEMY_UNIT
    );
  }

  get attackAOEShape() {
    return new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {});
  }

  get counterattackPattern() {
    return new AnywhereTargetingStrategy(
      this.game,
      this.player,
      TARGETING_TYPE.ENEMY_UNIT
    );
  }

  get counterattackAOEShape() {
    return new PointAOEShape(TARGETING_TYPE.UNIT, {});
  }

  canUseAbility(id: string) {
    const ability = this.abilities.find(ability => ability.id === id);
    if (!ability) return false;

    return this.interceptors.canUseAbility.getValue(ability.canUse, {
      card: this,
      ability
    });
  }

  getAbility(abilityId: string) {
    return this.abilities.find(ability => ability.abilityId === abilityId);
  }

  addAbility(ability: AbilityBlueprint<HeroCard>) {
    const newAbility = new Ability<HeroCard>(this.game, this, ability);
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
    this.exhaust();
  }
}
