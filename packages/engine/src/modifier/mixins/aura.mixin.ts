import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type { AnyCard } from '../../card/entities/card.entity';
import { GAME_EVENTS } from '../../game/game.events';

export type AuraOptions = {
  isElligible(card: AnyCard): boolean;
  onGainAura(unit: AnyCard): void;
  onLoseAura(unit: AnyCard): void;
  canSelfApply: boolean;
};

export class AuraModifierMixin extends ModifierMixin<AnyCard> {
  protected modifier!: Modifier<AnyCard>;

  private affectedCardIds = new Set<string>();

  // we need to track this variable because of how the event emitter works
  // basically if we have an event that says "after unit moves, remove this aura modifier"
  // It will not clean up aura's "after unit move" event before all the current listeners have been ran
  // which would lead to removing the aura, THEN check and apply the aura anyways
  private isApplied = true;

  constructor(
    game: Game,
    private options: AuraOptions
  ) {
    super(game);
    this.checkAura = this.checkAura.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  private checkAura() {
    if (!this.isApplied) return;

    this.game.cardSystem.cards.forEach(card => {
      if (!this.options.canSelfApply && card.equals(this.modifier.target)) return;
      const shouldGetAura = this.options.isElligible(card);

      const hasAura = this.affectedCardIds.has(card.id);

      if (!shouldGetAura && hasAura) {
        this.affectedCardIds.delete(card.id);
        this.options.onLoseAura(card);
        return;
      }

      if (shouldGetAura && !hasAura) {
        this.affectedCardIds.add(card.id);
        this.options.onGainAura(card);
        return;
      }
    });
  }

  private cleanup() {
    this.game.off('*', this.checkAura);

    this.affectedCardIds.forEach(id => {
      const card = this.game.cardSystem.getCardById(id);
      if (!card) return;

      this.affectedCardIds.delete(id);
      this.options.onLoseAura(card);
    });
  }

  onApplied(card: AnyCard, modifier: Modifier<AnyCard>): void {
    this.modifier = modifier;
    this.isApplied = true;

    this.game.on('*', this.checkAura);
    const unsub = this.game.on(GAME_EVENTS.CARD_AFTER_DESTROY, event => {
      if (event.data.card.equals(card)) {
        unsub();
        this.cleanup();
      }
    });
  }

  onRemoved() {
    this.isApplied = false;
    this.cleanup();
  }

  onReapplied() {}
}
