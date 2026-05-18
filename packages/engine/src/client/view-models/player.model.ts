import type { GameClient, GameStateEntities } from '../client';

import type { SerializedPlayer } from '../../player/player.entity';
import type { CardViewModel } from './card.model';
import { PatchApplier } from '../patch-applier';
import type { PatchOperation } from '../../game/systems/patch-types';

export class PlayerViewModel {
  private static patchApplier = new PatchApplier();
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

  /**
   * Update using patch operations for granular changes
   */
  updateWithPatches(patches: PatchOperation[]) {
    this.data = PlayerViewModel.patchApplier.applyPatches(this.data, patches);
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
    const entities = this.getEntities();
    return this.data.hand.map(card => {
      return entities[card.cardId] as CardViewModel;
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

  get hero() {
    if (!this.data.hero) return null;
    return this.getEntities()[this.data.hero] as CardViewModel;
  }

  get level() {
    return this.data.level;
  }

  get exp() {
    return this.data.exp;
  }

  get destinyDeck() {
    const entities = this.getEntities();
    return this.data.destinyDeck.map(cardId => entities[cardId] as CardViewModel);
  }

  get destinies() {
    const entities = this.getEntities();
    return this.data.destinies.map(destinyId => entities[destinyId] as CardViewModel);
  }

  get mana() {
    return this.data.currentMana;
  }

  get maxMana() {
    return this.data.maxMana;
  }
}
