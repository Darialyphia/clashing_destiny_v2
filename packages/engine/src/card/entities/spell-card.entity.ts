import type { MaybePromise } from '@game/shared';
import type { BoardCell } from '../../board/entities/board-cell.entity';
import type { SpellBlueprint } from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
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

// eslint-disable-next-line @typescript-eslint/ban-types
export type SerializedSpellCard = SerializedCard & {
  manaCost: number;
  unplayableReason: string | null;
};

export type SpellCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, SpellCard>;
};

export class SpellCard extends Card<
  SerializedSpellCard,
  SpellCardInterceptors,
  SpellBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<SpellBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable()
      },
      options
    );
  }

  get canAfford() {
    return this.player.canSpendMana(this.manaCost);
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
    return Promise.resolve();
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

        const targets = await this.blueprint.getTargets(this.game, this);

        resolve({ targets, cancelled: false });
      }
    );
  }

  getAOE(targets: BoardCell[]) {
    return this.blueprint.getAoe(this.game, this, targets);
  }

  async play(onCancel: () => MaybePromise<void>) {
    const { targets, cancelled } = await this.selectTargets();

    if (cancelled) {
      await onCancel();
      return;
    }

    await this.sendToDiscardPile();
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );

    const aoe = this.blueprint.getAoe(this.game, this, targets);
    await this.game.vfxSystem.playSequence(
      this.blueprint.vfx.sequences?.play?.(this.game, this, {
        targets: targets.map(t => t.position.serialize()),
        aoe
      }) ?? { tracks: [] }
    );

    await this.blueprint.onPlay(this.game, this, {
      targets,
      aoe
    });

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  serialize() {
    return {
      ...this.serializeBase(),
      manaCost: this.blueprint.manaCost,
      unplayableReason: this.unplayableReason
    };
  }
}
