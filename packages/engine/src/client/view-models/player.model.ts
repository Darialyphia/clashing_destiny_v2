import type { GameClient, GameStateEntities } from '../client';

import type { SerializedPlayer } from '../../player/player.entity';
import type { CardViewModel } from './card.model';
import { PatchApplier } from '../patch-applier';
import type { PatchOperation } from '../../game/systems/patch-types';
import type { BoardSpaceViewModel } from './board-space.model';

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

  get handSize() {
    return this.data.handSize;
  }

  get remainingCardsInMainDeck() {
    return this.data.remainingCardsInMainDeck;
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

  get victoryPoints() {
    return this.data.victoryPoints;
  }

  get runeZone() {
    return this.data.runeZone.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  get supplyZone() {
    return this.data.boardSide.supply.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  removeFromSupplyZone(cardId: string) {
    return this.update({
      boardSide: {
        ...this.data.boardSide,
        supply: this.data.boardSide.supply.filter(id => id !== cardId)
      }
    });
  }

  addToHand(cardId: string, isRevealed: boolean) {
    return this.update({
      hand: [...this.data.hand, { cardId, isLocked: false, isRevealed }],
      handSize: this.data.handSize + 1
    });
  }

  removeFromHand(cardId: string) {
    return this.update({
      hand: this.data.hand.filter(card => card.cardId !== cardId),
      handSize: this.data.handSize - 1
    });
  }

  updateMainDeckSize(delta: number) {
    return this.update({
      remainingCardsInMainDeck: this.data.remainingCardsInMainDeck + delta
    });
  }

  updateCardInHand(cardId: string, data: { isRevealed: boolean }) {
    return this.update({
      hand: this.data.hand.map(card =>
        card.cardId === cardId ? { ...card, ...data } : card
      )
    });
  }

  get affinities() {
    return this.data.affinities;
  }

  get base() {
    return this.data.boardSide.base.map(spaceId => {
      return this.getEntities()[spaceId] as BoardSpaceViewModel;
    });
  }

  get boardSide() {
    return this.data.boardSide;
  }

  get leftBattlefield() {
    return {
      id: this.data.boardSide.leftBattlefield.id,
      commandmentScore: this.data.boardSide.leftBattlefield.commandmentScore,
      opponentCommandmentScore:
        this.data.boardSide.leftBattlefield.opponentCommandmentScore,
      player: this.getEntities()[this.data.id] as PlayerViewModel,
      spaces: this.data.boardSide.leftBattlefield.spaces.map(spaceId => {
        return this.getEntities()[spaceId] as BoardSpaceViewModel;
      }),
      zone: this.data.boardSide.leftBattlefield.zone,
      locationCard: this.getEntities()[
        this.data.boardSide.leftBattlefield.locationCard
      ] as CardViewModel,
      secretCard: this.data.boardSide.leftBattlefield.secretCard
        ? (this.getEntities()[
            this.data.boardSide.leftBattlefield.secretCard
          ] as CardViewModel)
        : null
    };
  }

  get rightBattlefield() {
    return {
      id: this.data.boardSide.rightBattlefield.id,
      commandmentScore: this.data.boardSide.rightBattlefield.commandmentScore,
      opponentCommandmentScore:
        this.data.boardSide.rightBattlefield.opponentCommandmentScore,
      player: this.getEntities()[this.data.id] as PlayerViewModel,
      spaces: this.data.boardSide.rightBattlefield.spaces.map(spaceId => {
        return this.getEntities()[spaceId] as BoardSpaceViewModel;
      }),
      zone: this.data.boardSide.rightBattlefield.zone,
      locationCard: this.getEntities()[
        this.data.boardSide.rightBattlefield.locationCard
      ] as CardViewModel,
      secretCard: this.data.boardSide.rightBattlefield.secretCard
        ? (this.getEntities()[
            this.data.boardSide.rightBattlefield.secretCard
          ] as CardViewModel)
        : null
    };
  }

  get mana() {
    return this.data.currentMana;
  }

  get maxMana() {
    return this.data.maxMana;
  }
}
