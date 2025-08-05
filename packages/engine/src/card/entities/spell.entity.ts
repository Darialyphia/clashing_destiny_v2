import type { Game } from '../../game/game';
import { GAME_PHASES, type GamePhase } from '../../game/game.enums';
import { COMBAT_STEPS } from '../../game/phases/combat.phase';

import type { Player } from '../../player/player.entity';
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
  type AnyCard,
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

  get canPlayDuringChain() {
    return this.blueprint.subKind === SPELL_KINDS.BURST;
  }

  get authorizedPhases(): GamePhase[] {
    if (this.blueprint.subKind === SPELL_KINDS.BURST) {
      return [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];
    }
    return [GAME_PHASES.MAIN];
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

  async playWithTargets(targets: PreResponseTarget[]) {
    this.preResponseTargets = targets;
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardDeclarePlayEvent({ card: this })
    );
    const effect = {
      source: this,
      targets: this.preResponseTargets!,
      handler: async () => {
        await this.game.emit(
          CARD_EVENTS.CARD_BEFORE_PLAY,
          new CardBeforePlayEvent({ card: this })
        );
        this.updatePlayedAt();

        await this.blueprint.onPlay(this.game, this, this.preResponseTargets!);
        this.sendToDiscardPile();
        this.preResponseTargets?.forEach(target => {
          if (target instanceof Card) {
            target.clearTargetedBy({ type: 'card', card: this });
          }
        });
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

  async play() {
    const targets = await this.blueprint.getPreResponseTargets(this.game, this);
    await this.playWithTargets(targets);
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
