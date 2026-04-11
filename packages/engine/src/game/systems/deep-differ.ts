import { areArraysIdentical } from '../../utils/helpers';
import type { PatchOperation } from './patch-types';

/**
 * Deep differ that generates patch operations for changes between objects
 */
export class DeepDiffer {
  /**
   * Generate patches between two objects
   * @param current - Current state
   * @param previous - Previous state
   * @param basePath - Base path for nested properties (used in recursion)
   */
  generatePatches<T extends Record<string, any>>(
    current: T,
    previous: T | undefined,
    basePath = ''
  ): PatchOperation[] {
    if (!previous) return [];

    const patches: PatchOperation[] = [];

    for (const key in current) {
      const currentValue = current[key];
      const previousValue = previous[key];
      const path = basePath ? `${basePath}.${key}` : key;

      if (!(key in previous)) {
        patches.push({
          op: 'add',
          path,
          value: currentValue
        });
        continue;
      }

      if (Array.isArray(currentValue) && Array.isArray(previousValue)) {
        const arrayPatches = this.diffArrays(currentValue, previousValue, path);
        patches.push(...arrayPatches);
        continue;
      }

      if (this.isPlainObject(currentValue) && this.isPlainObject(previousValue)) {
        const nestedPatches = this.generatePatches(currentValue, previousValue, path);
        patches.push(...nestedPatches);
        continue;
      }

      if (currentValue !== previousValue) {
        patches.push({
          op: 'replace',
          path,
          value: currentValue
        });
      }
    }

    for (const key in previous) {
      if (!(key in current)) {
        const path = basePath ? `${basePath}.${key}` : key;
        patches.push({
          op: 'remove',
          path
        });
      }
    }

    return patches;
  }

  private diffArrays(current: any[], previous: any[], path: string): PatchOperation[] {
    if (areArraysIdentical(current, previous)) {
      return [];
    }

    const patches: PatchOperation[] = [];

    if (this.isIdArray(current) && this.isIdArray(previous)) {
      return this.diffIdArrays(current, previous, path);
    }

    patches.push({
      op: 'replace',
      path,
      value: current
    });

    return patches;
  }

  private diffIdArrays(
    current: string[],
    previous: string[],
    path: string
  ): PatchOperation[] {
    const patches: PatchOperation[] = [];
    const prevSet = new Set(previous);
    const currSet = new Set(current);

    const added = current.filter(id => !prevSet.has(id));

    const removed = previous.filter(id => !currSet.has(id));

    for (let i = previous.length - 1; i >= 0; i--) {
      if (removed.includes(previous[i])) {
        patches.push({
          op: 'remove',
          path: `${path}[${i}]`
        });
      }
    }

    // Insert added items at their correct index in the current array.
    // Processing left-to-right ensures earlier insertions shift indices
    // correctly for subsequent ones, so the index in `current` is always
    // the right insertion point at the time the patch is applied.
    const addedSet = new Set(added);
    for (let i = 0; i < current.length; i++) {
      if (addedSet.has(current[i])) {
        patches.push({
          op: 'add',
          path: `${path}[${i}]`,
          value: current[i]
        });
      }
    }

    return patches;
  }

  private isIdArray(arr: any[]): arr is string[] {
    return arr.every(item => typeof item === 'string');
  }

  private isPlainObject(value: any): value is Record<string, any> {
    return (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) === Object.prototype
    );
  }
}
