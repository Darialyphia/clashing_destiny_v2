import type { Game } from '../../game/game';
import { GAME_PHASES } from '../../game/game.enums';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { LocationBlueprint, SerializedAbility } from '../card-blueprint';
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
    return this.interceptors.canUseAbility.getValue(
      this.player.cardManager.hand.length >= ability.manaCost && ability.shouldExhaust
        ? !this.isExhausted
        : true && ability.canUse(this.game, this),
      this
    );
  }

  async useAbility(id: string) {
    const ability = this.blueprint.abilities.find(ability => ability.id === id);
    if (!ability) return;

    const targets = await ability.getPreResponseTargets(this.game, this);
    if (ability.shouldExhaust) {
      await this.exhaust();
    }
    const effect = {
      source: this,
      handler: async () => {
        await ability.onResolve(this.game, this, targets);
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

  serialize(): SerializedLocationCard {
    return {
      ...this.serializeBase(),
      manaCost: this.blueprint.manaCost,
      abilities: this.blueprint.abilities.map(ability => ({
        id: ability.id,
        canUse: this.canUseAbility(ability.id),
        name: ability.label,
        description: ability.description
      }))
    };
  }
}
