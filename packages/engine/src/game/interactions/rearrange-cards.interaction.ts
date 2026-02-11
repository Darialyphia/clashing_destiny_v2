import { assert } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../game';
import { InvalidPlayerError } from '../game-error';
import type { Player } from '../../player/player.entity';
import { INTERACTION_STATE_TRANSITIONS } from '../game.enums';
import { CardNotFoundError } from '../../card/card-errors';

export type RearrangeCardBucket = {
  id: string;
  label: string;
  cards: AnyCard[];
};
type RearrangeCardsContextOptions = {
  source: AnyCard;
  player: Player;
  buckets: Array<RearrangeCardBucket>;
  label: string;
};
export class RearrangeCardsContext {
  static async create(game: Game, options: RearrangeCardsContextOptions) {
    const instance = new RearrangeCardsContext(game, options);
    await instance.init();
    return instance;
  }

  readonly buckets: Array<RearrangeCardBucket> = [];

  readonly source: AnyCard;

  readonly player: Player;

  private label: string;

  private constructor(
    private game: Game,
    options: RearrangeCardsContextOptions
  ) {
    this.buckets = options.buckets;
    this.source = options.source;
    this.player = options.player;
    this.label = options.label;
  }

  async init() {}

  serialize() {
    return {
      player: this.player.id,
      label: this.label,
      source: this.source.id,
      buckets: this.buckets.map(bucket => ({
        id: bucket.id,
        label: bucket.label,
        cards: bucket.cards.map(card => card.id)
      }))
    };
  }

  commit(player: Player, buckets: Array<{ id: string; cards: string[] }> | null) {
    assert(player.equals(this.player), new InvalidPlayerError());
    const bucketsToUse =
      buckets ??
      this.buckets.map(bucket => ({
        id: bucket.id,
        cards: bucket.cards.map(card => card.id)
      }));

    const result = Object.fromEntries(
      bucketsToUse.map(bucket => {
        return [
          bucket.id,
          bucket.cards.map(cardId => {
            const card = this.game.cardSystem.getCardById(cardId);
            assert(card, new CardNotFoundError());
            return card;
          })
        ];
      })
    );

    this.game.interaction.dispatch(
      INTERACTION_STATE_TRANSITIONS.COMMIT_REARRANGING_CARDS
    );
    this.game.interaction.onInteractionEnd();

    this.game.inputSystem.unpause(result);
  }
}
