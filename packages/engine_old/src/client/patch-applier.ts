import type { PatchOperation } from '../game/systems/patch-types';
import { isReplacePatch, isAddPatch, isRemovePatch } from '../game/systems/patch-types';

/**
 * Applies patch operations to view model data
 */
export class PatchApplier {
  /**
   * Apply patches to an object (immutably)
   * Returns a new object with patches applied
   */
  applyPatches<T extends Record<string, any>>(obj: T, patches: PatchOperation[]): T {
    // Clone the object to avoid mutations
    let result = this.deepClone(obj);

    for (const patch of patches) {
      if (isReplacePatch(patch)) {
        result = this.applyReplace(result, patch.path, patch.value);
      } else if (isAddPatch(patch)) {
        result = this.applyAdd(result, patch.path, patch.value);
      } else if (isRemovePatch(patch)) {
        result = this.applyRemove(result, patch.path);
      }
    }

    return result;
  }

  /**
   * Apply a replace operation
   * Example: path='art.tint', value='#FF0000'
   */
  private applyReplace<T>(obj: T, path: string, value: any): T {
    const keys = this.parsePath(path);

    if (keys.length === 1) {
      // Top-level property
      return { ...obj, [keys[0]]: value } as T;
    }

    // Nested property - recursively clone and update
    const [first, ...rest] = keys;
    const current = (obj as any)[first];

    if (Array.isArray(current)) {
      // Handle array index: modifiers[2]
      const index = parseInt(rest[0]);
      if (rest.length === 1) {
        const newArray = [...current];
        newArray[index] = value;
        return { ...obj, [first]: newArray } as T;
      } else {
        // Deeper nesting: modifiers[2].name
        const newArray = [...current];
        newArray[index] = this.applyReplace(
          current[index],
          rest.slice(1).join('.'),
          value
        );
        return { ...obj, [first]: newArray } as T;
      }
    } else {
      // Nested object
      return {
        ...obj,
        [first]: this.applyReplace(current, rest.join('.'), value)
      } as T;
    }
  }

  /**
   * Apply an add operation
   * Example: path='modifiers[-]', value='mod4' (append)
   * Example: path='modifiers[2]', value='mod4' (insert at index)
   */
  private applyAdd<T>(obj: T, path: string, value: any): T {
    const keys = this.parsePath(path);
    const [first, ...rest] = keys;

    if (rest.length === 0) {
      // Adding top-level property
      return { ...obj, [first]: value } as T;
    }

    const current = (obj as any)[first];

    if (Array.isArray(current)) {
      const indexStr = rest[0];
      const newArray = [...current];

      if (indexStr === '-') {
        // Append to end
        newArray.push(value);
      } else {
        // Insert at index
        const index = parseInt(indexStr);
        newArray.splice(index, 0, value);
      }

      return { ...obj, [first]: newArray } as T;
    }

    // For nested objects, recurse
    return {
      ...obj,
      [first]: this.applyAdd(current, rest.join('.'), value)
    } as T;
  }

  /**
   * Apply a remove operation
   * Example: path='modifiers[2]'
   */
  private applyRemove<T>(obj: T, path: string): T {
    const keys = this.parsePath(path);
    const [first, ...rest] = keys;

    if (rest.length === 0) {
      // Remove top-level property
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [first]: removed, ...remaining } = obj as any;
      return remaining as T;
    }

    const current = (obj as any)[first];

    if (Array.isArray(current)) {
      const index = parseInt(rest[0]);
      const newArray = [...current];
      newArray.splice(index, 1);
      return { ...obj, [first]: newArray } as T;
    }

    // For nested objects, recurse
    return {
      ...obj,
      [first]: this.applyRemove(current, rest.join('.'))
    } as T;
  }

  /**
   * Parse a path string into keys
   * Example: 'art.tint' => ['art', 'tint']
   * Example: 'modifiers[2]' => ['modifiers', '2']
   * Example: 'modifiers[-]' => ['modifiers', '-']
   */
  private parsePath(path: string): string[] {
    return path
      .replace(/\[(\d+|-)\]/g, '.$1') // Convert [0] to .0, [-] to .-
      .split('.')
      .filter(Boolean);
  }

  /**
   * Deep clone an object
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.deepClone(item)) as any;

    const cloned: any = {};
    for (const key in obj) {
      cloned[key] = this.deepClone(obj[key]);
    }
    return cloned;
  }
}
