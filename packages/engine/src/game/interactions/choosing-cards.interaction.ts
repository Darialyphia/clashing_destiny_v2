import { assert, isDefined } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../game';
import {
  NotEnoughCardsError,
  TooManyCardsError,
  InvalidPlayerError
} from '../game-error';
import type { Player } from '../../player/player.entity';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';

type PlayerId = Player['id'];

type CardChoices = Array<{
  card: AnyCard;
  aiHints: {
    shouldPick: (game: Game, player: Player) => number;
  };
}>;

type ChooseCardPlayerConfig = {
  choices: CardChoices;
  minChoiceCount: number;
  maxChoiceCount: number;
  label: string;
  timeoutFallback: AnyCard[];
};

export type ChoosingCardsContextOptions<T extends boolean = boolean> = {
  players: Record<PlayerId, ChooseCardPlayerConfig>;
  canCancel: T;
};
export class ChoosingCardsContext {
  static async create<T extends boolean = boolean>(
    game: Game,
    options: ChoosingCardsContextOptions<T>
  ) {
    const instance = new ChoosingCardsContext(game, options);
    await instance.init();
    return instance;
  }

  private selectedCards: Record<PlayerId, AnyCard[]> = {};
  private committedPlayers = new Set<PlayerId>();

  private constructor(
    private game: Game,
    private options: ChoosingCardsContextOptions
  ) {
    for (const playerId of Object.keys(this.options.players)) {
      this.selectedCards[playerId] = [];
    }
  }

  async init() {}

  serialize() {
    return {
      players: Object.keys(this.options.players).filter(
        playerId => !this.committedPlayers.has(playerId)
      ),
      initialPlayers: Object.keys(this.options.players),
      playerConfig: Object.fromEntries(
        Object.entries(this.options.players).map(([playerId, config]) => [
          playerId,
          {
            choices: config.choices.map(choice => choice.card.id),
            minChoiceCount: config.minChoiceCount,
            maxChoiceCount: config.maxChoiceCount,
            label: config.label,
            selected: this.selectedCards[playerId].map(card => card.id) ?? []
          }
        ])
      ),
      canCancel: this.options.canCancel
    };
  }

  async commit(player: Player, indices: number[] | null) {
    const playerId = player.id;
    const playerConfig = this.options.players[playerId];
    assert(playerConfig, new InvalidPlayerError());
    assert(!this.committedPlayers.has(playerId), new InvalidPlayerError());
    if (isDefined(indices)) {
      assert(
        indices.length >= playerConfig.minChoiceCount,
        new NotEnoughCardsError(playerConfig.minChoiceCount, indices.length)
      );
      assert(
        indices.length <= playerConfig.maxChoiceCount,
        new TooManyCardsError(playerConfig.maxChoiceCount, indices.length)
      );

      this.selectedCards[playerId] = indices.map(
        index => playerConfig.choices[index].card
      );
    } else {
      this.selectedCards[playerId] = [...playerConfig.timeoutFallback];
    }
    this.committedPlayers.add(playerId);

    if (this.committedPlayers.size < Object.keys(this.options.players).length) {
      await this.game.snapshotSystem.takeSnapshot();
      return;
    }

    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CARDS,
      {}
    );
    this.game.inputSystem.unpause({
      cancelled: false,
      result: Object.fromEntries(
        Object.entries(this.selectedCards).map(([playerId, cards]) => [
          playerId,
          {
            player: this.game.playerSystem.getPlayerById(playerId)!,
            cards
          }
        ])
      )
    });
  }

  async cancel(player: Player) {
    assert(this.options.players[player.id], new InvalidPlayerError());
    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.CANCEL_CHOOSING_CARDS,
      {}
    );

    this.game.inputSystem.unpause({ cancelled: true, result: null });
  }

  getChoices(player: Player) {
    assert(this.options.players[player.id], new InvalidPlayerError());
    return [...this.options.players[player.id].choices];
  }

  getPlayerConfig(player: Player) {
    assert(this.options.players[player.id], new InvalidPlayerError());
    return this.options.players[player.id];
  }

  get players() {
    return Object.keys(this.options.players).map(
      id => this.game.playerSystem.getPlayerById(id)!
    );
  }
}
