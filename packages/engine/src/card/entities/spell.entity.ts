import type { Game } from '../../game/game';
import { GAME_PHASES, type GamePhase } from '../../game/game.enums';
import { COMBAT_STEPS } from '../../game/phases/combat.phase';

import type { Player } from '../../player/player.entity';
import { LoyaltyDamage } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import {
  serializePreResponseTarget,
  type PreResponseTarget,
  type SerializedPreResponseTarget,
  type SpellBlueprint
} from '../card-blueprint';
import { CARD_EVENTS, SPELL_KINDS, type SpellKind } from '../card.enums';
import { CardBeforePlayEvent, CardDeclarePlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';

export type SerializedSpellCard = SerializedCard & {
  manaCost: number;
  baseManaCost: number;
  subKind: SpellKind;
  preResponseTargets: SerializedPreResponseTarget[] | null;
};
export type SpellCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, SpellCard>;
};

export class SpellCard extends Card<
  SerializedCard,
  SpellCardInterceptors,
  SpellBlueprint<PreResponseTarget>
> {
  private preResponseTargets: PreResponseTarget[] | null = null;

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
    const gameStateCtx = this.game.gamePhaseSystem.getContext();

    return this.interceptors.canPlay.getValue(
      this.authorizedPhases.includes(this.game.gamePhaseSystem.getContext().state) &&
        (gameStateCtx.state === GAME_PHASES.ATTACK
          ? gameStateCtx.ctx.step === COMBAT_STEPS.BUILDING_CHAIN
          : true) &&
        this.location === 'hand' &&
        this.canPayManaCost &&
        this.hasAffinityMatch &&
        this.blueprint.canPlay(this.game, this) &&
        (this.game.effectChainSystem.currentChain ? this.canPlayDuringChain : true),
      this
    );
  }

  async play() {
    const targets = await this.blueprint.getPreResponseTargets(this.game, this);

    this.preResponseTargets = targets;
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardDeclarePlayEvent({ card: this })
    );
    const effect = {
      source: this,
      targets,
      handler: async () => {
        await this.game.emit(
          CARD_EVENTS.CARD_BEFORE_PLAY,
          new CardBeforePlayEvent({ card: this })
        );
        this.updatePlayedAt();

        await this.blueprint.onPlay(this.game, this, targets);
        this.sendToDiscardPile();
        await this.game.emit(
          CARD_EVENTS.CARD_AFTER_PLAY,
          new CardBeforePlayEvent({ card: this })
        );
        this.preResponseTargets = null;
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
      manaCost: this.manaCost,
      baseManaCost: this.blueprint.manaCost,
      subKind: this.blueprint.subKind,
      preResponseTargets: this.preResponseTargets
        ? this.preResponseTargets.map(serializePreResponseTarget)
        : null
    };
  }
}
