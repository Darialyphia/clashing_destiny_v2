import { isString, type Constructor, type Nullable } from '@game/shared';
import { Modifier, ModifierLifecycleEvent, type ModifierTarget } from './modifier.entity';
import type { Game } from '../game/game';
import { GAME_EVENTS } from '../game/game.events';

export class ModifierManager<T extends ModifierTarget> {
  private _modifiers: Modifier<T>[] = [];

  constructor(
    private game: Game,
    private target: T
  ) {
    this.onModifierRemoved = this.onModifierRemoved.bind(this);
    game.on(GAME_EVENTS.MODIFIER_AFTER_REMOVED, this.onModifierRemoved);
  }

  cleanup() {
    this.game.off(GAME_EVENTS.MODIFIER_AFTER_REMOVED, this.onModifierRemoved);
  }

  has(modifierOrId: string | Modifier<T> | Constructor<Modifier<T>>) {
    if (modifierOrId instanceof Modifier) {
      return this._modifiers.some(modifier =>
        modifier.modifierType === modifierOrId.modifierType && modifier.isUnique
          ? true
          : modifier.equals(modifierOrId)
      );
    } else if (isString(modifierOrId)) {
      return this._modifiers.some(modifier => modifier.modifierType === modifierOrId);
    } else {
      return this._modifiers.some(modifier => modifier.constructor === modifierOrId);
    }
  }

  get<TArg extends string | Modifier<T> | Constructor<Modifier<T>>>(
    modifierOrType: TArg
  ): TArg extends Constructor<Modifier<T>>
    ? Nullable<InstanceType<TArg>>
    : Nullable<Modifier<T>> {
    if (modifierOrType instanceof Modifier) {
      return this._modifiers.find(modifier => modifier.equals(modifierOrType)) as any;
    } else if (isString(modifierOrType)) {
      return this._modifiers.find(
        modifier => modifier.modifierType === modifierOrType
      ) as any;
    } else {
      return this._modifiers.find(
        modifier => modifier.constructor === modifierOrType
      ) as any;
    }
  }

  async add(modifier: Modifier<T>) {
    if (this.has(modifier)) {
      const mod = this.get(modifier.modifierType)!;
      await mod!.reapplyTo(this.target, modifier.stacks);
      return mod;
    } else {
      this._modifiers.push(modifier);
      await modifier.applyTo(this.target);

      return modifier;
    }
  }

  private onModifierRemoved(event: ModifierLifecycleEvent) {
    this._modifiers = this._modifiers.filter(mod => !mod.equals(event.data));
  }

  async remove(modifierOrType: string | Modifier<T> | Constructor<Modifier<T>>) {
    const modToRemove = this._modifiers.find(mod => {
      if (modifierOrType instanceof Modifier) {
        return mod.equals(modifierOrType);
      } else if (isString(modifierOrType)) {
        return modifierOrType === mod.modifierType || modifierOrType === mod.id;
      } else {
        return mod.constructor === modifierOrType;
      }
    });
    if (!modToRemove) return;

    await modToRemove.remove();
  }

  get list() {
    return [...this._modifiers];
  }
}
