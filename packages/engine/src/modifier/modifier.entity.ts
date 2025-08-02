import { type EmptyObject, type Serializable, type Values } from '@game/shared';
import type { ModifierMixin } from './modifier-mixin';
import { Entity } from '../entity';
import type { Game } from '../game/game';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { ModifierManager } from './modifier-manager.component';
import type { AnyCard } from '../card/entities/card.entity';

export type ModifierInfos<TCustomEvents extends Record<string, any>> =
  TCustomEvents extends EmptyObject
    ? {
        name?: string;
        description?: string;
        icon?: string;
        isUnique?: boolean;
        customEventNames?: never;
      }
    : {
        name?: string;
        description?: string;
        isUnique?: boolean;
        icon?: string;
        customEventNames: TCustomEvents;
      };

export type ModifierOptions<
  T extends ModifierTarget,
  TCustomEvents extends Record<string, any>
> = ModifierInfos<TCustomEvents> & {
  mixins: ModifierMixin<T>[];
  stacks?: number;
};

class ModifierLifecycleEvent extends TypedSerializableEvent<
  Modifier<any>,
  SerializedModifier
> {
  serialize() {
    return this.data.serialize();
  }
}

export const MODIFIER_EVENTS = {
  BEFORE_APPLIED: 'modifier.before_applied',
  AFTER_APPLIED: 'modifier.after_applied',
  BEFORE_REMOVED: 'modifier.before_removed',
  AFTER_REMOVED: 'modifier.after_removed',
  BEFORE_REAPPLIED: 'before_reapplied',
  AFTER_REAPPLIED: 'after_reapplied'
} as const;

export type ModifierEventMap = {
  [MODIFIER_EVENTS.BEFORE_APPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.AFTER_APPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.BEFORE_REMOVED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.AFTER_REMOVED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.BEFORE_REAPPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.AFTER_REAPPLIED]: ModifierLifecycleEvent;
};

export type ModifierEvent = Values<typeof MODIFIER_EVENTS>;

export type ModifierTarget = {
  id: string;
  modifiers: ModifierManager<any>;
};

export type SerializedModifier = {
  id: string;
  modifierType: string;
  entityType: 'modifier';
  name?: string;
  description?: string;
  icon?: string;
  target: string;
  source: string;
  stacks: number;
};

export class Modifier<
    T extends ModifierTarget,
    TEventsMap extends ModifierEventMap = ModifierEventMap
  >
  extends Entity<EmptyObject>
  implements Serializable<SerializedModifier>
{
  private mixins: ModifierMixin<T>[];

  protected game: Game;

  readonly source: AnyCard;

  protected _target!: T;

  private isApplied = false;

  readonly infos: { name?: string; description?: string; icon?: string };

  readonly modifierType: string;

  protected _stacks = 1;

  private _isEnabled = true;

  private _isUnique: boolean;

  constructor(
    modifierType: string,
    game: Game,
    source: AnyCard,
    options: ModifierOptions<
      T,
      Record<Exclude<keyof TEventsMap, keyof ModifierEventMap>, boolean>
    >
  ) {
    super(game.modifierIdFactory(modifierType), {});
    this.game = game;
    this.modifierType = modifierType;
    this.source = source;
    this.mixins = options.mixins;
    this.infos = {
      description: options.description,
      name: options.name,
      icon: options.icon
    };
    this._isUnique = options.isUnique ?? false;
    if (options.stacks) {
      this._stacks = options.stacks;
    }
  }

  get isUnique() {
    return this._isUnique;
  }

  get isEnabled() {
    return this._isEnabled;
  }

  get stacks() {
    return this._stacks;
  }

  enable() {
    if (this._isEnabled) return;
    this._isEnabled = true;
    if (this.isApplied) {
      this.mixins.forEach(mixin => mixin.onApplied(this._target, this));
    }
  }

  disable() {
    if (!this._isEnabled) return;
    this._isEnabled = false;
    if (this.isApplied) {
      this.mixins.forEach(mixin => mixin.onRemoved(this._target, this));
    }
  }

  addMixin(mixin: ModifierMixin<T>) {
    this.mixins.push(mixin);
    if (this.isApplied) {
      mixin.onApplied(this._target, this);
    }
  }

  removeMixin(mixin: ModifierMixin<T>) {
    const index = this.mixins.indexOf(mixin);
    if (index !== -1) {
      this.mixins.splice(index, 1);
      if (this.isApplied) {
        mixin.onRemoved(this._target, this);
      }
    }
  }

  get target() {
    return this._target;
  }

  async applyTo(target: T) {
    await this.game.emit(
      MODIFIER_EVENTS.BEFORE_APPLIED,
      new ModifierLifecycleEvent(this)
    );
    this._target = target;
    if (this.isEnabled) {
      this.mixins.forEach(mixin => {
        mixin.onApplied(target, this);
      });
    }
    this.isApplied = true;
    await this.game.emit(MODIFIER_EVENTS.AFTER_APPLIED, new ModifierLifecycleEvent(this));
  }

  async reapplyTo(target: T, stacks = 1) {
    await this.game.emit(
      MODIFIER_EVENTS.BEFORE_REAPPLIED,
      new ModifierLifecycleEvent(this)
    );
    this._stacks += stacks;
    if (this.isEnabled) {
      this.mixins.forEach(mixin => {
        mixin.onReapplied(target, this);
      });
    }

    await this.game.emit(
      MODIFIER_EVENTS.AFTER_REAPPLIED,
      new ModifierLifecycleEvent(this)
    );
  }

  async remove() {
    await this.game.emit(
      MODIFIER_EVENTS.BEFORE_REMOVED,
      new ModifierLifecycleEvent(this)
    );
    this.mixins.forEach(mixin => {
      mixin.onRemoved(this._target, this);
    });
    this.isApplied = false;
    await this.game.emit(MODIFIER_EVENTS.AFTER_REMOVED, new ModifierLifecycleEvent(this));
  }

  addStacks(count: number) {
    this._stacks += count;
  }

  async removeStacks(count: number) {
    this._stacks = Math.max(0, this._stacks - count);
    if (this._stacks <= 0) {
      await this.remove();
    }
  }

  serialize(): SerializedModifier {
    return {
      id: this.id,
      modifierType: this.modifierType,
      entityType: 'modifier' as const,
      name: this.infos.name,
      description: this.infos.description,
      icon: this.infos.icon,
      target: this._target.id,
      source: this.source.id,
      stacks: this._stacks
    };
  }
}

export const modifierIdFactory = () => {
  let nextId = 0;
  return (id: string) => `modifier_${id}_${nextId++}`;
};
