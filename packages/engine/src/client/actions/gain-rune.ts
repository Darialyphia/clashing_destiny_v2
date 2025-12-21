import { uppercaseFirstLetter } from '@game/shared';
import { CARD_KINDS, CARD_LOCATIONS, type Rune } from '../../card/card.enums';
import { GAME_PHASES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';

export class GainRuneAction implements CardActionRule {
  id = 'gain_rune';
  private rune: Rune;

  constructor(
    private client: GameClient,
    rune: Rune
  ) {
    this.id = `gain_rune_${rune}`;
    this.rune = rune;
  }

  predicate(card: CardViewModel) {
    return (
      card.kind === CARD_KINDS.HERO &&
      card.location === CARD_LOCATIONS.BOARD &&
      this.client.state.phase.state === GAME_PHASES.MAIN &&
      !this.client.state.effectChain &&
      card.player.canPerformResourceAction &&
      this.client.isActive()
    );
  }

  getLabel() {
    return `Gain @[${this.rune.toLocaleLowerCase()}]@ ${uppercaseFirstLetter(this.rune.toLocaleLowerCase())} Rune`;
  }

  handler() {
    this.client.dispatch({
      type: 'commitResourceAction',
      payload: {
        type: 'gain_rune',
        rune: this.rune,
        playerId: this.client.playerId
      }
    });
  }
}
