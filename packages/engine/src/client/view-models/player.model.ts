import type { GameClient, GameStateEntities } from '../client';

import type { SerializedPlayer } from '../../player/player.entity';
import type { CardViewModel } from './card.model';

export class PlayerViewModel {
  private getEntities: () => GameStateEntities;
  private getClient: () => GameClient;

  constructor(
    private data: SerializedPlayer,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: PlayerViewModel | SerializedPlayer) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedPlayer>) {
    Object.assign(this.data, data);
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get currentHp() {
    return this.data.currentHp;
  }

  get maxHp() {
    return this.data.maxHp;
  }

  get unlockedAffinities() {
    return this.data.unlockedAffinities;
  }

  get handSize() {
    return this.data.handSize;
  }

  get remainingCardsInDeck() {
    return this.data.remainingCardsInDeck;
  }

  get isPlayer1() {
    return this.data.isPlayer1;
  }

  get talentIds() {
    return this.data.talents;
  }

  getTalents() {
    return this.data.talents.map(talentId => {
      return this.getEntities()[talentId] as CardViewModel;
    });
  }

  getHand() {
    return this.data.hand.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  getDiscardPile() {
    return this.data.discardPile.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  getBanishPile() {
    return this.data.banishPile.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  getOpponent() {
    const entity = Object.values(this.getEntities()).find(
      entity => entity instanceof PlayerViewModel && entity.id !== this.id
    );
    return entity as PlayerViewModel;
  }

  getDestinyDeck() {
    return this.data.destinyDeck.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  declareEndTurn() {
    this.getClient().adapter.dispatch({
      type: 'declareEndTurn',
      payload: {
        playerId: this.data.id
      }
    });
  }

  playCard(index: number) {
    const card = this.getHand()[index];
    if (!card) return;
    if (!card.canPlay) return;

    this.getClient().adapter.dispatch({
      type: 'declarePlayCard',
      payload: {
        playerId: this.data.id,
        index: index
      }
    });
  }

  playDestinyCard(index: number) {
    const card = this.getDestinyDeck()[index];
    if (!card) return;
    if (!card.canPlay) return;
    this.getClient().adapter.dispatch({
      type: 'playDestinyCard',
      payload: {
        playerId: this.data.id,
        index: index
      }
    });
  }
}
