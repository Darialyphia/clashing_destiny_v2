import type { MaybePromise } from '@game/shared';
import type { Game } from '../../game/game';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import {
  serializePreResponseTarget,
  type PreResponseTarget,
  type SerializedPreResponseTarget,
  type SpellBlueprint
} from '../card-blueprint';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';

export type SerializedSpellCard = SerializedCard & {
  manaCost: number;
  baseManaCost: number;
  preResponseTargets: SerializedPreResponseTarget[] | null;
};
export type SpellCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, SpellCard>;
};

export class SpellCard extends Card<
  SerializedCard,
  SpellCardInterceptors,
  SpellBlueprint
> {
  private preResponseTargets: PreResponseTarget[] | null = null;

  constructor(game: Game, player: Player, options: CardOptions<SpellBlueprint>) {
    super(
      game,
      player,
      { ...makeCardInterceptors(), canPlay: new Interceptable() },
      options
    );
  }

  replacePreResponseTarget(oldTarget: AnyCard, newTarget: AnyCard) {
    if (!this.preResponseTargets) return;
    if (newTarget instanceof Card) {
      const index = this.preResponseTargets.findIndex(
        t => t instanceof Card && t.equals(oldTarget)
      );
      if (index === -1) return;

      oldTarget.clearTargetedBy({ type: 'card', card: this });

      this.preResponseTargets[index] = newTarget;
      newTarget.targetBy({ type: 'card', card: this });
    }
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPlayBase && this.blueprint.canPlay(this.game, this),
      this
    );
  }

  async playWithTargets(
    targets: PreResponseTarget[],
    onResolved?: () => MaybePromise<void>
  ) {
    this.preResponseTargets = targets;

    await this.insertInChainOrExecute(
      async () => {
        await this.blueprint.onPlay(this.game, this, this.preResponseTargets!);

        this.dispose();

        this.preResponseTargets?.forEach(target => {
          if (target instanceof Card) {
            target.clearTargetedBy({ type: 'card', card: this });
          }
        });
        this.preResponseTargets = null;
      },
      targets,
      onResolved
    );
  }

  async play(onResolved: () => MaybePromise<void>) {
    const targets = await this.blueprint.getPreResponseTargets(this.game, this);
    await this.playWithTargets(targets, onResolved);
  }

  serialize(): SerializedSpellCard {
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      baseManaCost: this.manaCost,
      preResponseTargets: this.preResponseTargets
        ? this.preResponseTargets.map(serializePreResponseTarget)
        : null
    };
  }
}
