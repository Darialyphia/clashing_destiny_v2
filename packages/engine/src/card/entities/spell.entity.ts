import type { Game } from '../../game/game';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { PreResponseTarget, SpellBlueprint } from '../card-blueprint';
import { SPELL_KINDS, type SpellKind } from '../card.enums';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';

export type SerializedSpellCard = SerializedCard & {
  manaCost: number;
  subKind: SpellKind;
};
export type AbilityCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, SpellCard>;
};

export class SpellCard extends Card<
  SerializedCard,
  AbilityCardInterceptors,
  SpellBlueprint<PreResponseTarget>
> {
  constructor(
    game: Game,
    player: Player,
    options: CardOptions<SpellBlueprint<PreResponseTarget>>
  ) {
    super(
      game,
      player,
      { ...makeCardInterceptors(), canPlay: new Interceptable() },
      options
    );
  }

  get canPlayDuringChain() {
    return this.blueprint.subKind === SPELL_KINDS.BURST;
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost && this.game.effectChainSystem.currentChain
        ? this.canPlayDuringChain
        : true && this.blueprint.canPlay(this.game, this),
      this
    );
  }

  async play() {
    const targets = await this.blueprint.getPreResponseTargets(this.game, this);

    const effect = {
      source: this,
      handler: async () => {
        await this.blueprint.onPlay(this.game, this, targets);
        this.removeFromCurrentLocation();
        this.player.cardManager.sendToDiscardPile(this);
      }
    };

    if (this.game.effectChainSystem.currentChain) {
      this.game.effectChainSystem.addEffect(effect, this.player);
    } else {
      void this.game.effectChainSystem.createChain(this.player, effect);
    }
  }

  serialize(): SerializedSpellCard {
    return {
      ...this.serializeBase(),
      manaCost: this.blueprint.manaCost,
      subKind: this.blueprint.subKind
    };
  }
}
