import { isString, type Constructor, type Nullable } from '@game/shared';
import { Modifier, type ModifierTarget } from './modifier.entity';
import type { EmpowerModifier } from './modifiers/empower.modifier';

export class ModifierManager<T extends ModifierTarget> {
  private _modifiers: Modifier<T>[] = [];

  constructor(private target: T) {
    this.onModifierRemoved = this.onModifierRemoved.bind(this);
  }

  has(modifierOrId: string | Modifier<T, any> | Constructor<Modifier<T>>) {
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

  get<TArg extends string | Modifier<T, any> | Constructor<Modifier<T>>>(
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
      await modifier.onRemoved(this.onModifierRemoved);

      return modifier;
    }
  }

  private onModifierRemoved(modifier: Modifier<T>) {
    this._modifiers = this._modifiers.filter(mod => !mod.equals(modifier));
    modifier;
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
