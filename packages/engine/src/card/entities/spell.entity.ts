import type { Game } from '../../game/game';
import { GAME_PHASES, type GamePhase } from '../../game/game.enums';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { PreResponseTarget, SpellBlueprint } from '../card-blueprint';
import { CARD_EVENTS, SPELL_KINDS, type SpellKind } from '../card.enums';
import { CardBeforePlayEvent } from '../card.events';
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
export type SpellCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, SpellCard>;
};

export class SpellCard extends Card<
  SerializedCard,
  SpellCardInterceptors,
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

  get authorizedPhases(): GamePhase[] {
    if (this.blueprint.subKind === SPELL_KINDS.BURST) {
      return [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];
    }
    return [GAME_PHASES.MAIN];
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.authorizedPhases.includes(this.game.gamePhaseSystem.getContext().state) &&
        this.location === 'hand' &&
        this.canPayManaCost &&
        (this.hasAffinityMatch ? this.blueprint.canPlay(this.game, this) : true) &&
        (this.game.effectChainSystem.currentChain ? this.canPlayDuringChain : true),
      this
    );
  }

  async play() {
    const targets = await this.blueprint.getPreResponseTargets(this.game, this);

    const effect = {
      source: this,
      handler: async () => {
        await this.game.emit(
          CARD_EVENTS.CARD_BEFORE_PLAY,
          new CardBeforePlayEvent({ card: this })
        );
        this.updatePlayedAt();
        await this.blueprint.onPlay(this.game, this, targets);
        this.removeFromCurrentLocation();
        this.player.cardManager.sendToDiscardPile(this);
        await this.game.emit(
          CARD_EVENTS.CARD_AFTER_PLAY,
          new CardBeforePlayEvent({ card: this })
        );
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
