import type { HeroBlueprint } from '../card-blueprint';
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
};

export class HeroCard extends Card<
  SerializedHeroCard,
  HeroCardInterceptors,
  HeroBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<HeroBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        retaliation: new Interceptable()
      },
      options
    );
  }

  canPlay() {
    return true;
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
}
