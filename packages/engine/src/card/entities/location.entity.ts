import type { Game } from '../../game/game';
import { GAME_PHASES, type GamePhase } from '../../game/game.enums';

import type { Player } from '../../player/player.entity';
import { LoyaltyDamage } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import {
  serializePreResponseTarget,
  type LocationBlueprint,
  type PreResponseTarget,
  type SerializedAbility
} from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';

export type SerializedLocationCard = SerializedCard & {
  manaCost: number;
  abilities: SerializedAbility[];
};
export type LocationCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, LocationCard>;
  canUseAbility: Interceptable<boolean, LocationCard>;
};

export class LocationCard extends Card<
  SerializedCard,
  LocationCardInterceptors,
  LocationBlueprint
> {
  private abilityTargets = new Map<string, PreResponseTarget[]>();

  constructor(game: Game, player: Player, options: CardOptions<LocationBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canUseAbility: new Interceptable()
      },
      options
    );
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        !this.game.effectChainSystem.currentChain &&
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
    this.removeFromCurrentLocation();

    if (!this.hasAffinityMatch) {
      await this.player.hero.takeDamage(this, new LoyaltyDamage(this));
    }
    await this.player.boardSide.changeLocation(this);
    await this.blueprint.onPlay(this.game, this);

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  canUseAbility(id: string) {
    const ability = this.blueprint.abilities.find(ability => ability.id === id);
    if (!ability) return false;

    const authorizedPhases: GamePhase[] = [
      GAME_PHASES.MAIN,
      GAME_PHASES.ATTACK,
      GAME_PHASES.END
    ];

    return this.interceptors.canUseAbility.getValue(
      this.player.cardManager.hand.length >= ability.manaCost &&
        authorizedPhases.includes(this.game.gamePhaseSystem.getContext().state) &&
        this.game.effectChainSystem.currentChain
        ? this.game.effectChainSystem.currentChain.canAddEffect(this.player)
        : this.game.gamePhaseSystem.turnPlayer.equals(this.player) &&
            (ability.shouldExhaust
              ? !this.isExhausted
              : true && ability.canUse(this.game, this)),
      this
    );
  }

  async useAbility(id: string) {
    const ability = this.blueprint.abilities.find(ability => ability.id === id);
    if (!ability) return;

    const targets = await ability.getPreResponseTargets(this.game, this);
    this.abilityTargets.set(id, targets);

    if (ability.shouldExhaust) {
      await this.exhaust();
    }
    const effect = {
      source: this,
      targets,
      handler: async () => {
        await ability.onResolve(this.game, this, targets);
        this.abilityTargets.delete(id);
      }
    };

    if (this.game.effectChainSystem.currentChain) {
      this.game.effectChainSystem.addEffect(effect, this.player);
    } else {
      void this.game.effectChainSystem.createChain(this.player, effect);
    }
  }

  serialize(): SerializedLocationCard {
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      abilities: this.blueprint.abilities.map(ability => ({
        id: ability.id,
        canUse: this.canUseAbility(ability.id),
        name: ability.label,
        description: ability.description,
        targets:
          this.abilityTargets.get(ability.id)?.map(serializePreResponseTarget) ?? null
      }))
    };
  }
}
