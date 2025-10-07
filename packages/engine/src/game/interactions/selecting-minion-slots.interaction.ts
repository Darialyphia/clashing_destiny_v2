import { assert } from '@game/shared';
import type { MinionSlot } from '../../board/board-side.entity';
import { IllegalTargetError } from '../../input/input-errors';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import {
  InvalidPlayerError,
  UnableToCommitError,
  INTERACTION_STATE_TRANSITIONS
} from '../systems/game-interaction.system';
import { BOARD_SLOT_ZONES, type BoardSlotZone } from '../../board/board.constants';

export type BoardPosition = {
  player: Player;
  slot: MinionSlot;
  zone: BoardSlotZone;
};

type SelectingMinionSlotsContextOptions = {
  isElligible: (position: BoardPosition, selectedSlots: BoardPosition[]) => boolean;
  canCommit: (selectedSlots: BoardPosition[]) => boolean;
  isDone(selectedSlots: BoardPosition[]): boolean;
  player: Player;
};

export class SelectingMinionSlotsContext {
  static async create(
    game: Game,
    options: SelectingMinionSlotsContextOptions
  ): Promise<SelectingMinionSlotsContext> {
    const instance = new SelectingMinionSlotsContext(game, options);
    await instance.init();
    return instance;
  }

  private selectedPositions: BoardPosition[] = [];

  private isElligible: (
    position: BoardPosition,
    selectedSlots: BoardPosition[]
  ) => boolean;

  private canCommit: (selectedSlots: BoardPosition[]) => boolean;

  private isDone: (selectedSlots: BoardPosition[]) => boolean;

  readonly player: Player;

  private constructor(
    private game: Game,
    options: SelectingMinionSlotsContextOptions
  ) {
    this.player = options.player;
    this.isElligible = options.isElligible;
    this.canCommit = options.canCommit;
    this.isDone = options.isDone;
  }

  init() {}

  private get elligiblePositions() {
    const result: BoardPosition[] = [];
    this.game.playerSystem.players.forEach(player => {
      Object.values(BOARD_SLOT_ZONES).forEach(zone => {
        for (let i = 0; i < this.game.config.ATTACK_ZONE_SLOTS; i++) {
          const slot = i;
          const elligible = this.isElligible(
            { player, slot, zone },
            this.selectedPositions
          );
          if (!elligible) continue;

          result.push({
            player,
            slot,
            zone
          });
        }
      });
    });

    return result;
  }

  serialize() {
    return {
      selectedPositions: this.selectedPositions.map(pos => ({
        player: pos.player.id,
        slot: pos.slot,
        zone: pos.zone
      })),
      elligiblePosition: this.elligiblePositions.map(pos => ({
        playerId: pos.player.id,
        slot: pos.slot,
        zone: pos.zone
      })),
      player: this.player.id,
      canCommit: this.canCommit(this.selectedPositions)
    };
  }

  private async autoCommitIfAble() {
    const isDone = this.isDone(this.selectedPositions);
    const canCommit = this.canCommit(this.selectedPositions);
    if (isDone && canCommit) {
      this.commit(this.player);
    } else {
      await this.game.inputSystem.askForPlayerInput();
    }
  }

  async selectPosition(player: Player, pos: BoardPosition) {
    assert(player.equals(this.player), new InvalidPlayerError());
    assert(this.isElligible(pos, this.selectedPositions), new IllegalTargetError());
    this.selectedPositions.push(pos);
    await this.autoCommitIfAble();
  }

  commit(player: Player) {
    assert(this.canCommit, new UnableToCommitError());
    assert(player.equals(this.player), new InvalidPlayerError());
    this.game.interaction.dispatch(
      INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_MINION_SLOT
    );
    this.game.interaction.onInteractionEnd();
    this.game.inputSystem.unpause(this.selectedPositions);
  }
}
