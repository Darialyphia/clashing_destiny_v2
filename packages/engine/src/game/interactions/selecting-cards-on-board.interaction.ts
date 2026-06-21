import { assert } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import { IllegalTargetError } from '../../input/input-errors';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';

import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';
import { InvalidPlayerError, UnableToCommitError } from '../game-error';

export type SelectingCardOnBoardContextOptions = {
  player: Player;
  label: string;
  source: AnyCard;
  isElligible: (card: AnyCard, selectedCards: AnyCard[]) => boolean;
  canCommit: (selectedCards: AnyCard[]) => boolean;
  isDone(selectedCards: AnyCard[]): boolean;
  timeoutFallback: AnyCard[];
  canCancel: boolean;
  aiHints: {
    shouldPick: (game: Game, player: Player, selectedCards: AnyCard[]) => number;
  };
};

export class SelectingCardOnBoardContext {
  static async create(game: Game, options: SelectingCardOnBoardContextOptions) {
    const instance = new SelectingCardOnBoardContext(game, options);
    await instance.init();
    return instance;
  }
  private selectedCards: AnyCard[] = [];

  private timeoutFallback: AnyCard[];

  private isElligible: (card: AnyCard, selectedCards: AnyCard[]) => boolean;

  private canCommit: (selectedCards: AnyCard[]) => boolean;

  private isDone: (selectedCards: AnyCard[]) => boolean;

  readonly player: Player;

  readonly label: string;

  private constructor(
    private game: Game,
    private options: SelectingCardOnBoardContextOptions
  ) {
    this.player = options.player;
    this.isElligible = options.isElligible;
    this.canCommit = options.canCommit;
    this.isDone = options.isDone;
    this.label = options.label;
    this.timeoutFallback = options.timeoutFallback;
  }

  serialize() {
    return {
      player: this.player.id,
      selectedCards: this.selectedCards.map(card => card.id),
      elligibleCards: this.game.cardSystem
        .getAllCardsInPlay()
        .filter(card => this.isElligible(card, this.selectedCards))
        .map(card => card.id),
      canCommit: this.canCommit(this.selectedCards),
      label: this.label,
      canCancel: this.options.canCancel,
      source: this.options.source.id
    };
  }

  async init() {}

  private async autoCommitIfAble() {
    const isDone = this.isDone(this.selectedCards);
    const canCommit = this.canCommit(this.selectedCards);
    if (isDone && canCommit) {
      await this.commit(this.player);
    } else {
      await this.game.inputSystem.askForPlayerInput();
    }
  }

  async selectCard(player: Player, card: AnyCard) {
    assert(player.equals(this.player), new InvalidPlayerError());
    assert(this.isElligible(card, this.selectedCards), new IllegalTargetError());
    this.selectedCards.push(card);
    await this.autoCommitIfAble();
  }

  async commit(player: Player, isTimeout = false) {
    if (isTimeout) {
      this.selectedCards = [...this.timeoutFallback];
    }
    assert(this.canCommit(this.selectedCards), new UnableToCommitError());
    assert(player.equals(this.player), new InvalidPlayerError());

    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_CARDS_ON_BOARD,
      {}
    );

    this.game.inputSystem.unpause({ cancelled: false, result: this.selectedCards });
  }

  async cancel(player: Player) {
    assert(player.equals(this.player), new InvalidPlayerError());
    await this.game.interaction.sendTransition(
      INTERACTION_STATE_TRANSITIONS.CANCEL_SELECTING_CARDS_ON_BOARD,
      {}
    );

    this.game.inputSystem.unpause({ cancelled: true, result: null });
  }
}
