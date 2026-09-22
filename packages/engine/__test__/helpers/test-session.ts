import type { CardBlueprint } from '../../src/card/card-blueprint';
import { isMinion } from '../../src/card/card-utils';
import type { AnyCard } from '../../src/card/entities/card.entity';
import { CARDS_DICTIONARY } from '../../src/card/sets';
import type { BoardRow, BoardSpace } from '../../src/board/board-space.entity';
import type { Config } from '../../src/config';
import { Game, type GameOptions } from '../../src/game/game';
import type {
  GameStateSnapshot,
  SerializedOmniscientState
} from '../../src/game/systems/game-snapshot.system';
import type { SerializedInput } from '../../src/input/input-system';
import type { Player, PlayerOptions } from '../../src/player/player.entity';

export const TEST_PLAYER_IDS = {
  player1: 'test-player-1',
  player2: 'test-player-2'
} as const;

export type TestPlayerId = (typeof TEST_PLAYER_IDS)[keyof typeof TEST_PLAYER_IDS];
export type DeckCard = PlayerOptions['deck']['cards'][number];

type WaitForSnapshotOptions = {
  timeoutMs?: number;
};

export class TestSessionBuilder {
  private readonly decks: Record<TestPlayerId, DeckCard[]> = {
    [TEST_PLAYER_IDS.player1]: [],
    [TEST_PLAYER_IDS.player2]: []
  };

  private readonly customBlueprints: Record<string, CardBlueprint> = {};

  private rngSeed = 'test-seed';

  private enableSnapshots = true;

  private config: Partial<Config> = {
    INITIAL_HAND_SIZE: 0,
    SHUFFLE_DECK_ON_GAME_START: false,
    START_OF_GAME_MULLIGANED_CARDS: 0
  };

  withDeck(playerId: TestPlayerId, cards: DeckCard[]) {
    this.decks[playerId] = [...cards];
    return this;
  }

  withPlayer1Deck(cards: DeckCard[]) {
    return this.withDeck(TEST_PLAYER_IDS.player1, cards);
  }

  withPlayer2Deck(cards: DeckCard[]) {
    return this.withDeck(TEST_PLAYER_IDS.player2, cards);
  }

  withRngSeed(seed: string) {
    this.rngSeed = seed;
    return this;
  }

  withConfig(config: Partial<Config>) {
    this.config = { ...this.config, ...config };
    return this;
  }

  withSnapshots(enabled: boolean) {
    this.enableSnapshots = enabled;
    return this;
  }

  withBlueprints(...blueprints: CardBlueprint[]) {
    for (const blueprint of blueprints) {
      this.customBlueprints[blueprint.id] = blueprint;
    }
    return this;
  }

  async build() {
    const options: GameOptions = {
      id: 'test-game',
      rngSeed: this.rngSeed,
      overrides: {
        cardPool: {
          ...CARDS_DICTIONARY,
          ...this.customBlueprints
        },
        config: this.config
      },
      players: [
        {
          id: TEST_PLAYER_IDS.player1,
          name: 'Player 1',
          deck: { cards: this.decks[TEST_PLAYER_IDS.player1] }
        },
        {
          id: TEST_PLAYER_IDS.player2,
          name: 'Player 2',
          deck: { cards: this.decks[TEST_PLAYER_IDS.player2] }
        }
      ],
      enableSnapshots: this.enableSnapshots
    };
    const game = new Game(options);
    await game.initialize();

    return new TestSession(game, this.enableSnapshots);
  }
}

export class TestSession {
  static builder() {
    return new TestSessionBuilder();
  }

  private readonly pendingWaits = new Set<(reason: Error) => void>();

  constructor(
    readonly game: Game,
    private readonly snapshotsEnabled: boolean
  ) {}

  get player1() {
    return this.game.playerSystem.player1;
  }

  get player2() {
    return this.game.playerSystem.player2;
  }

  get phase() {
    return this.game.gamePhaseSystem.getState();
  }

  get interaction() {
    return this.game.interaction.getContext();
  }

  get inputHistory() {
    return this.game.inputSystem.getHistory();
  }

  get latestSnapshot() {
    this.requireSnapshotsEnabled();
    return this.game.snapshotSystem.getLatestOmniscientSnapshot();
  }

  getPlayer(playerId: TestPlayerId): Player {
    const player = this.game.playerSystem.getPlayerById(playerId);
    if (!player) throw new Error(`Unknown test player: ${playerId}`);
    return player;
  }

  getBoardSpace(playerId: TestPlayerId, zone: BoardRow, index: number): BoardSpace {
    const space = this.game.boardSystem.getBoardSpaceAt({ playerId, zone, index });
    if (!space) {
      throw new Error(`Board space does not exist: ${playerId}/${zone}/${index}`);
    }
    return space;
  }

  getCardsInHand(playerId: TestPlayerId) {
    return [...this.getPlayer(playerId).cardManager.hand];
  }

  getCardsInPlay(playerId?: TestPlayerId) {
    if (playerId) return this.getPlayer(playerId).boardSide.getAllCardsInPlay();
    return this.game.cardSystem.getAllCardsInPlay();
  }

  requireCard<TCard extends AnyCard = AnyCard>(cardId: string): TCard {
    const card = this.game.cardSystem.getCardById<TCard>(cardId);
    if (!card) throw new Error(`Card not found: ${cardId}`);
    return card;
  }

  requireCardByBlueprint<TCard extends AnyCard = AnyCard>(
    playerId: TestPlayerId,
    blueprintId: string
  ): TCard {
    const card = this.game.cardSystem.cards.find(
      candidate =>
        candidate.player.id === playerId && candidate.blueprintId === blueprintId
    ) as TCard | undefined;
    if (!card) throw new Error(`Card not found for ${playerId}: ${blueprintId}`);
    return card;
  }

  async addCardToHand<TCard extends AnyCard = AnyCard>(
    playerId: TestPlayerId,
    blueprintId: string,
    isFoil = false
  ) {
    const card = await this.game.cardSystem.addCard<TCard>(
      this.getPlayer(playerId),
      blueprintId,
      isFoil
    );
    await card.addToHand();
    return card;
  }

  /** Direct fixture setup: this does not run play, summon, or movement lifecycle effects. */
  async addMinionToBoard(
    playerId: TestPlayerId,
    blueprintId: string,
    zone: BoardRow,
    index: number,
    isFoil = false
  ) {
    const space = this.getBoardSpace(playerId, zone, index);
    if (space.isOccupied) throw new Error(`Board space is occupied: ${space.id}`);

    const card = await this.game.cardSystem.addCard(
      this.getPlayer(playerId),
      blueprintId,
      isFoil
    );
    if (!isMinion(card)) throw new Error(`Card is not a minion: ${blueprintId}`);

    space.placeCard(card);
    return card;
  }

  subscribeToSnapshot(
    callback: (snapshot: GameStateSnapshot<SerializedOmniscientState>) => void
  ) {
    this.requireSnapshotsEnabled();
    return this.game.subscribeOmniscientState(callback);
  }

  waitForSnapshot(
    predicate: (snapshot: GameStateSnapshot<SerializedOmniscientState>) => boolean,
    { timeoutMs = 1_000 }: WaitForSnapshotOptions = {}
  ) {
    this.requireSnapshotsEnabled();

    return new Promise<GameStateSnapshot<SerializedOmniscientState>>(
      (resolve, reject) => {
        let settled = false;
        let unsubscribe = () => {};

        // eslint-disable-next-line prefer-const
        let timeout: ReturnType<typeof setTimeout> | undefined;

        const cleanup = () => {
          unsubscribe();
          if (timeout) clearTimeout(timeout);
          this.pendingWaits.delete(cancel);
        };
        const resolveSnapshot = (
          snapshot: GameStateSnapshot<SerializedOmniscientState>
        ) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(snapshot);
        };
        const rejectWait = (error: Error) => {
          if (settled) return;
          settled = true;
          cleanup();
          reject(error);
        };
        const cancel = (reason: Error) => rejectWait(reason);
        const check = (snapshot: GameStateSnapshot<SerializedOmniscientState>) => {
          try {
            if (predicate(snapshot)) {
              resolveSnapshot(snapshot);
            } else if (snapshot.kind === 'error') {
              rejectWait(
                new Error(`Received an error snapshot while waiting for a match`)
              );
            }
          } catch (error) {
            rejectWait(error instanceof Error ? error : new Error(String(error)));
          }
        };

        this.pendingWaits.add(cancel);
        check(this.latestSnapshot);
        if (settled) return;

        unsubscribe = this.subscribeToSnapshot(check);
        timeout = setTimeout(() => {
          rejectWait(
            new Error(`Timed out after ${timeoutMs}ms waiting for a snapshot match`)
          );
        }, timeoutMs);
      }
    );
  }

  async dispatch(input: SerializedInput) {
    await this.game.dispatch(input);
  }

  async declarePlay(playerId: TestPlayerId, cardId: string) {
    await this.dispatch({ type: 'declarePlayCard', payload: { playerId, id: cardId } });
  }

  async move(playerId: TestPlayerId, cardId: string, zone: BoardRow, index: number) {
    await this.dispatch({ type: 'move', payload: { playerId, cardId, zone, index } });
  }

  async pass(playerId: TestPlayerId) {
    await this.dispatch({ type: 'pass', payload: { playerId } });
  }

  async useAbility(playerId: TestPlayerId, cardId: string, abilityId: string) {
    await this.dispatch({
      type: 'declareUseCardAbility',
      payload: { playerId, cardId, abilityId }
    });
  }

  async selectCards(playerId: TestPlayerId, cardIds: string[]) {
    for (const cardId of cardIds) {
      await this.dispatch({ type: 'selectCardOnBoard', payload: { playerId, cardId } });
    }
    await this.dispatch({ type: 'commitCardSelection', payload: { playerId } });
  }

  async selectSpaces(playerId: TestPlayerId, spaceIds: string[]) {
    for (const id of spaceIds) {
      await this.dispatch({ type: 'selectSpaceOnBoard', payload: { playerId, id } });
    }
    await this.dispatch({ type: 'commitSpaceSelection', payload: { playerId } });
  }

  async chooseCards(playerId: TestPlayerId, indices: number[]) {
    await this.dispatch({ type: 'chooseCards', payload: { playerId, indices } });
  }

  async chooseChainEffect(playerId: TestPlayerId, id: string) {
    await this.dispatch({ type: 'chooseChainEffects', payload: { playerId, id } });
  }

  async answerQuestion(playerId: TestPlayerId, id: string) {
    await this.dispatch({ type: 'answerQuestion', payload: { playerId, id } });
  }

  async cancelInteraction(playerId: TestPlayerId) {
    await this.dispatch({ type: 'cancelInteraction', payload: { playerId } });
  }

  shutdown() {
    const error = new Error('Test session shut down while waiting for a snapshot');
    for (const cancel of this.pendingWaits) cancel(error);
    this.game.shutdown();
  }

  private requireSnapshotsEnabled() {
    if (!this.snapshotsEnabled) {
      throw new Error('Snapshots are disabled for this test session');
    }
  }
}
