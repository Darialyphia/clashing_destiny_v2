import type { Game } from '../../game/game';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';
import { GAME_EVENTS } from '../../game/game.events';

import type { Player } from '../../player/player.entity';
import { LoyaltyDamage } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import type { AttackBlueprint } from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
import { CardBeforePlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';

export type SerializedAttackCard = SerializedCard & {
  manaCost: number;
  baseManaCost: number;
  damage: number;
};
export type AttackCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, AttackCard>;
  damage: Interceptable<number, AttackCard>;
};

export class AttackCard extends Card<
  SerializedCard,
  AttackCardInterceptors,
  AttackBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<AttackBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        damage: new Interceptable()
      },
      options
    );
  }

  get damage(): number {
    return this.interceptors.damage.getValue(this.blueprint.damage, this);
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        !this.game.effectChainSystem.currentChain &&
        !this.player.hero.isExhausted &&
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
    this.sendToDiscardPile();

    if (!this.hasAffinityMatch) {
      await this.player.hero.takeDamage(this, new LoyaltyDamage(this));
    }
    const cleanups = [
      await this.player.hero.addInterceptor('atk', val => val + this.damage)
    ];
    this.game.once(GAME_EVENTS.AFTER_RESOLVE_COMBAT, () => {
      cleanups.forEach(unsub => unsub());
    });
    const [target] = await this.blueprint.getPreResponseTargets(this.game, this);
    await this.blueprint.onPlay(this.game, this);
    await this.game.gamePhaseSystem.startCombat();
    await this.game.gamePhaseSystem
      .getContext<GamePhasesDict['ATTACK']>()
      .ctx.declareAttacker(this.player.hero);
    await this.game.gamePhaseSystem
      .getContext<GamePhasesDict['ATTACK']>()
      .ctx.declareAttackTarget(target);

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
  }

  serialize(): SerializedAttackCard {
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      baseManaCost: this.blueprint.manaCost,
      damage: this.damage
    };
  }
}
