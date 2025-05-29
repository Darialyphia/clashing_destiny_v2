import type { Game } from '../../game/game';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';
import { GAME_EVENTS } from '../../game/game.events';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { AttackBlueprint } from '../card-blueprint';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';

export type SerializedAttackCard = SerializedCard & {
  manaCost: number;
};
export type AttackCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, AttackCard>;
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
      { ...makeCardInterceptors(), canPlay: new Interceptable() },
      options
    );
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        !this.game.effectChainSystem.currentChain &&
        !this.player.hero.isExhausted &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  async play() {
    const cleanups = [
      await this.player.hero.addInterceptor('canBeBlocked', () => false),
      await this.player.hero.addInterceptor('atk', val => val + this.blueprint.damage)
    ];
    const unsub = this.game.on(GAME_EVENTS.BEFORE_CHANGE_PHASE, e => {
      if (e.data.from === GAME_PHASES.ATTACK) {
        cleanups.forEach(unsub => unsub());
        unsub();
      }
    });
    const [target] = await this.blueprint.getPreResponseTargets(this.game, this);
    await this.game.gamePhaseSystem.startCombat();
    await this.game.gamePhaseSystem
      .getContext<GamePhasesDict['ATTACK']>()
      .ctx.declareAttacker({ attacker: this.player.hero, target });
  }

  serialize(): SerializedAttackCard {
    return {
      ...this.serializeBase(),
      manaCost: this.blueprint.manaCost
    };
  }
}
