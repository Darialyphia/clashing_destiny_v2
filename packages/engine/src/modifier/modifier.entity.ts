import { isFunction, isString, type Serializable, type Values } from '@game/shared';
import type { ModifierMixin } from './modifier-mixin';
import { Entity } from '../entity';
import type { Game } from '../game/game';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { ModifierManager } from './modifier-manager.component';
import type { AnyCard } from '../card/entities/card.entity';
import { Interceptable } from '../utils/interceptable';

export type ModifierOptions<T extends ModifierTarget> = {
  name?: string | (() => string);
  description?: string | (() => string);
  icon?: string | (() => string);
  isUnique?: boolean;
  mixins: ModifierMixin<T>[];
  groupKey?: string;
  stacks?: number;
};

export class ModifierLifecycleEvent extends TypedSerializableEvent<
  Modifier<any>,
  SerializedModifier
> {
  serialize() {
    return this.data.serialize();
  }
}

export const MODIFIER_EVENTS = {
  MODIFIER_BEFORE_APPLIED: 'modifier.before_applied',
  MODIFIER_AFTER_APPLIED: 'modifier.after_applied',
  MODIFIER_BEFORE_REMOVED: 'modifier.before_removed',
  MODIFIER_AFTER_REMOVED: 'modifier.after_removed',
  MODIFIER_BEFORE_REAPPLIED: 'before_reapplied',
  MODIFIER_AFTER_REAPPLIED: 'after_reapplied'
} as const;

export type ModifierEventMap = {
  [MODIFIER_EVENTS.MODIFIER_BEFORE_APPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.MODIFIER_AFTER_APPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.MODIFIER_BEFORE_REMOVED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.MODIFIER_AFTER_REMOVED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.MODIFIER_BEFORE_REAPPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.MODIFIER_AFTER_REAPPLIED]: ModifierLifecycleEvent;
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
  isEnabled: boolean;
  groupKey: string; // Optional key to group similar modifiers in the UI
};

export type ModifierInterceptors = {
  isEnabled: Interceptable<boolean>;
};

export class Modifier<T extends ModifierTarget>
  extends Entity<ModifierInterceptors>
  implements Serializable<SerializedModifier>
{
  private mixins: ModifierMixin<T>[];

  protected game: Game;

  readonly initialSource: AnyCard;

  // A unique modifier of the same type could be applied from different sources (for example auras)
  // We need to keep track of those so can remove the modifier only when it has no source left
  _sources = new Set<AnyCard>();

  protected _target!: T;

  private _isApplied = false;

  readonly infos: {
    name?: string | (() => string);
    description?: string | (() => string);
    icon?: string | (() => string);
    groupKey?: string;
  };

  readonly modifierType: string;

  protected _stacks = 1;

  private _isUnique: boolean;

  private _prevEnabled = true;

  constructor(
    modifierType: string,
    game: Game,
    source: AnyCard,
    options: ModifierOptions<T>
  ) {
    super(game.modifierIdFactory(modifierType), {
      isEnabled: new Interceptable()
    });
    this.game = game;
    this.modifierType = modifierType;
    this._sources.add(source);
    this.initialSource = source;
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
    this.game.on('*', this.checkEnabled.bind(this));
  }

  get isUnique() {
    return this._isUnique;
  }

  get isApplied() {
    return this._isApplied;
  }

  get isEnabled() {
    return this.interceptors.isEnabled.getValue(true, {});
  }

  get stacks() {
    return this._stacks;
  }

  get sources() {
    return this._sources;
  }

  checkEnabled() {
    if (!this._isApplied) return;
    if (this.isEnabled !== this._prevEnabled) {
      if (this.isEnabled) {
        this.mixins.forEach(mixin => mixin.onApplied(this._target, this));
      } else {
        this.mixins.forEach(mixin => mixin.onRemoved(this._target, this));
      }
    }
    this._prevEnabled = this.isEnabled;
  }

  addMixin(mixin: ModifierMixin<T>) {
    this.mixins.push(mixin);
    if (this._isApplied) {
      mixin.onApplied(this._target, this);
    }
  }

  removeMixin(mixin: ModifierMixin<T>) {
    const index = this.mixins.indexOf(mixin);
    if (index !== -1) {
      this.mixins.splice(index, 1);
      if (this._isApplied) {
        mixin.onRemoved(this._target, this);
      }
    }
  }

  get target() {
    return this._target;
  }

  async applyTo(target: T) {
    await this.game.emit(
      MODIFIER_EVENTS.MODIFIER_BEFORE_APPLIED,
      new ModifierLifecycleEvent(this)
    );
    this._target = target;
    if (this.isEnabled) {
      this.mixins.forEach(mixin => {
        mixin.onApplied(target, this);
      });
    }
    this._isApplied = true;
    await this.game.emit(
      MODIFIER_EVENTS.MODIFIER_AFTER_APPLIED,
      new ModifierLifecycleEvent(this)
    );
  }

  async reapplyTo(target: T, stacks = 1) {
    await this.game.emit(
      MODIFIER_EVENTS.MODIFIER_BEFORE_REAPPLIED,
      new ModifierLifecycleEvent(this)
    );
    this._stacks += stacks;
    if (this.isEnabled) {
      this.mixins.forEach(mixin => {
        mixin.onReapplied(target, this);
      });
    }

    await this.game.emit(
      MODIFIER_EVENTS.MODIFIER_AFTER_REAPPLIED,
      new ModifierLifecycleEvent(this)
    );
  }

  async remove() {
    await this.game.emit(
      MODIFIER_EVENTS.MODIFIER_BEFORE_REMOVED,
      new ModifierLifecycleEvent(this)
    );
    this._isApplied = false;
    this.mixins.forEach(mixin => {
      mixin.onRemoved(this._target, this);
    });
    await this.game.emit(
      MODIFIER_EVENTS.MODIFIER_AFTER_REMOVED,
      new ModifierLifecycleEvent(this)
    );
  }

  async removeSource(source: AnyCard) {
    this._sources.delete(source);
    if (this._sources.size === 0) {
      return this.remove();
    }
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

  async setStacks(count: number) {
    this._stacks = count;
    if (this._stacks <= 0) {
      await this.remove();
    }
  }

  serialize(): SerializedModifier {
    return {
      id: this.id,
      modifierType: this.modifierType,
      entityType: 'modifier' as const,
      name: isFunction(this.infos.name) ? this.infos.name() : this.infos.name,
      description: isFunction(this.infos.description)
        ? this.infos.description()
        : this.infos.description,
      icon: isFunction(this.infos.icon) ? this.infos.icon() : this.infos.icon,
      target: this._target.id,
      source: this.initialSource.id,
      stacks: this._stacks,
      isEnabled: this.isEnabled,
      groupKey: this.infos.groupKey ?? this.modifierType
    };
  }
}

export const modifierIdFactory = () => {
  let nextId = 0;
  return (id: string) => `modifier_${id}_${nextId++}`;
};
