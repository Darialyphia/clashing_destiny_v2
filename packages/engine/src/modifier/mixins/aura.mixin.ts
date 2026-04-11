import type { Modifier, ModifierTarget } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Unit } from '../../unit/unit.entity';
import type { Player } from '../../player/player.entity';

export type AuraOptions<TCandidate extends ModifierTarget> = {
  isElligible(candidate: TCandidate): boolean;
  getModifiers: (candidate: TCandidate) => Modifier<TCandidate>[];
  getCandidates: () => TCandidate[];
};

class AuraModifierMixin<
  T extends ModifierTarget,
  TCandidate extends ModifierTarget
> extends ModifierMixin<T> {
  protected modifier!: Modifier<T>;

  private modifiersPerCandidateId = new Map<string, Modifier<TCandidate>[]>();
  // we need to track this variable because of how the event emitter works
  // basically if we have an event that says "after unit moves, remove this aura modifier"
  // It will not clean up aura's "after unit move" event before all the current listeners have been ran
  // which would lead to removing the aura, THEN check and apply the aura anyways
  private isApplied = true;

  constructor(
    game: Game,
    private source: AnyCard,
    private options: AuraOptions<TCandidate>
  ) {
    super(game);
    this.checkAura = this.checkAura.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  private async checkAura() {
    if (!this.isApplied) return;

    for (const candidate of this.options.getCandidates()) {
      const shouldGetAura = this.options.isElligible(candidate);

      const hasAura = this.modifiersPerCandidateId.has(candidate.id);

      if (!shouldGetAura && hasAura) {
        const modifierstoRemove = this.modifiersPerCandidateId.get(candidate.id)!;
        this.modifiersPerCandidateId.delete(candidate.id);
        for (const mod of modifierstoRemove) {
          await mod.removeSource(this.source);
        }
        continue;
      }

      if (shouldGetAura && !hasAura) {
        const modifiers = this.options.getModifiers(candidate);
        this.modifiersPerCandidateId.set(candidate.id, modifiers);
        for (const mod of modifiers) {
          await candidate.modifiers.add(mod);
        }
        continue;
      }
    }
  }

  private async cleanup() {
    this.game.off('*', this.checkAura);
    for (const id of this.modifiersPerCandidateId.keys()) {
      const modifierstoRemove = this.modifiersPerCandidateId.get(id)!;
      this.modifiersPerCandidateId.delete(id);

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
    console.log('cleanup aura');
    this.isApplied = false;
    await this.cleanup();
  }

  onReapplied() {}
}

export class CardAuraModifierMixin<T extends AnyCard> extends AuraModifierMixin<
  ModifierTarget,
  T
> {
  constructor(
    game: Game,
    source: AnyCard,
    options: Omit<AuraOptions<T>, 'getCandidates'>
  ) {
    super(game, source, {
      ...options,
      getCandidates: () => game.cardSystem.cards as T[]
    });
  }
}

export class UnitAuraModifierMixin extends AuraModifierMixin<ModifierTarget, Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: Omit<AuraOptions<Unit>, 'getCandidates'>
  ) {
    super(game, source, {
      ...options,
      getCandidates: () => game.unitSystem.units
    });
  }
}
export class PlayerAuraModifierMixin extends AuraModifierMixin<ModifierTarget, Player> {
  constructor(
    game: Game,
    source: AnyCard,
    options: Omit<AuraOptions<Player>, 'getCandidates'>
  ) {
    super(game, source, {
      ...options,
      getCandidates: () => game.playerSystem.players
    });
  }
}
