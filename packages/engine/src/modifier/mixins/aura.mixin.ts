import {
  ModifierLifecycleEvent,
  type Modifier,
  type ModifierTarget
} from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type { AnyCard } from '../../card/entities/card.entity';
import type { StarEvent } from '../../utils/typed-emitter';
import { GAME_EVENTS, type GameEventMap } from '../../game/game.events';

export type AuraOptions = {
  isElligible(candidate: AnyCard): boolean;
  getModifiers: (candidate: AnyCard) => Modifier<AnyCard>[];
};

export class AuraModifierMixin<T extends ModifierTarget> extends ModifierMixin<T> {
  protected modifier!: Modifier<T>;

  private affectedCards = new Map<string, Modifier<AnyCard>[]>();
  // we need to track this variable because of how the event emitter works
  // basically if we have an event that says "after unit moves, remove this aura modifier"
  // It will not clean up aura's "after unit move" event before all the current listeners have been ran
  // which would lead to removing the aura, THEN check and apply the aura anyways
  private isApplied = true;

  constructor(
    game: Game,
    private source: AnyCard,
    private options: AuraOptions
  ) {
    super(game);
    this.checkAura = this.checkAura.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  private async checkAura(event: StarEvent<GameEventMap>) {
    if (!this.isApplied) return;

    for (const card of this.game.cardSystem.cards) {
      const shouldGetAura = this.options.isElligible(card);

      const hasAura = this.affectedCards.has(card.id);

      if (!shouldGetAura && hasAura) {
        const modifierstoRemove = this.affectedCards.get(card.id) ?? [];
        this.affectedCards.delete(card.id);
        for (const mod of modifierstoRemove) {
          await mod.removeSource(this.source);
        }
        continue;
      }

      if (shouldGetAura && !hasAura) {
        const modifiers = this.options.getModifiers(card);
        this.affectedCards.set(card.id, modifiers);
        for (const mod of modifiers) {
          await card.modifiers.add(mod);
        }
        continue;
      }
    }
  }

  private async cleanup() {
    this.game.off('*', this.checkAura);

    for (const id of this.affectedCards.keys()) {
      const card = this.game.cardSystem.getCardById(id);
      if (!card) return;

      this.affectedCards.delete(id);
      const modifierstoRemove = this.affectedCards.get(card.id) ?? [];
      for (const mod of modifierstoRemove) {
        await mod.removeSource(this.source);
      }
    }
  }

  onApplied(card: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.isApplied = true;

    this.game.on('*', this.checkAura);
  }

  async onRemoved() {
    this.isApplied = false;
    await this.cleanup();
  }

  onReapplied() {}
}
