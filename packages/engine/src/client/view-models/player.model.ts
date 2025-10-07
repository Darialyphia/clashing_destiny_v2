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
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  clone() {
    return new PlayerViewModel(this.data, this.getEntities(), this.getClient());
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

  get handSize() {
    return this.data.handSize;
  }

  get influence() {
    return this.data.influence;
  }

  get remainingCardsInMainDeck() {
    return this.data.remainingCardsInMainDeck;
  }

  get remainingCardsInDestinyDeck() {
    return this.data.remainingCardsInDestinyDeck;
  }

  get isPlayer1() {
    return this.data.isPlayer1;
  }

  get hand() {
    return this.data.hand.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  get discardPile() {
    return this.data.discardPile.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  get banishPile() {
    return this.data.banishPile.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  get opponent() {
    const entity = Object.values(this.getEntities()).find(
      entity => entity instanceof PlayerViewModel && entity.id !== this.id
    );
    return entity as PlayerViewModel;
  }
}
