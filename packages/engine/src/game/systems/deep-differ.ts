import type { PatchOperation } from './patch-types';
import { areArraysIdentical } from '../../utils/utils';

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
    // If no previous state, return nothing (new entity handled separately)
    if (!previous) return [];

    const patches: PatchOperation[] = [];

    // Check all properties in current
    for (const key in current) {
      const currentValue = current[key];
      const previousValue = previous[key];
      const path = basePath ? `${basePath}.${key}` : key;

      // Property didn't exist before - it's an add
      if (!(key in previous)) {
        patches.push({
          op: 'add',
          path,
          value: currentValue
        });
        continue;
      }

      // Handle arrays specially
      if (Array.isArray(currentValue) && Array.isArray(previousValue)) {
        const arrayPatches = this.diffArrays(currentValue, previousValue, path);
        patches.push(...arrayPatches);
        continue;
      }

      // Handle nested objects recursively
      if (this.isPlainObject(currentValue) && this.isPlainObject(previousValue)) {
        const nestedPatches = this.generatePatches(currentValue, previousValue, path);
        patches.push(...nestedPatches);
        continue;
      }

      // Primitive value - check if changed
      if (currentValue !== previousValue) {
        patches.push({
          op: 'replace',
          path,
          value: currentValue
        });
      }
    }

    // Check for removed properties
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

  /**
   * Diff two arrays and generate patches
   * For game entities, arrays are typically:
   * - IDs (strings): order doesn't matter much, use set operations
   * - Primitives (numbers, strings): order matters
   */
  private diffArrays(current: any[], previous: any[], path: string): PatchOperation[] {
    // Quick check - if identical, no patches
    if (areArraysIdentical(current, previous)) {
      return [];
    }

    const patches: PatchOperation[] = [];

    // Strategy 1: If all items are primitives/IDs, do smart diffing
    if (this.isIdArray(current) && this.isIdArray(previous)) {
      return this.diffIdArrays(current, previous, path);
    }

    // Strategy 2: For other cases, replace the whole array
    // This is simpler and works for small arrays
    patches.push({
      op: 'replace',
      path,
      value: current
    });

    return patches;
  }

  /**
   * Diff arrays of IDs/primitives (order-independent for IDs)
   * Example: modifiers: ['mod1', 'mod2'] vs ['mod1', 'mod2', 'mod3']
   */
  private diffIdArrays(
    current: string[],
    previous: string[],
    path: string
  ): PatchOperation[] {
    const patches: PatchOperation[] = [];
    const prevSet = new Set(previous);
    const currSet = new Set(current);

    // Find added items
    const added = current.filter(id => !prevSet.has(id));

    // Find removed items
    const removed = previous.filter(id => !currSet.has(id));

    // Generate patches for removals (do these first, by index from end)
    for (let i = previous.length - 1; i >= 0; i--) {
      if (removed.includes(previous[i])) {
        patches.push({
          op: 'remove',
          path: `${path}[${i}]`
        });
      }
    }

    // Generate patches for additions (append to end)
    for (const item of added) {
      patches.push({
        op: 'add',
        path: `${path}[-]`, // Special notation: append to end
        value: item
      });
    }

    return patches;
  }

  /**
   * Check if array contains only string IDs
   */
  private isIdArray(arr: any[]): arr is string[] {
    return arr.every(item => typeof item === 'string');
  }

  /**
   * Check if value is a plain object (not array, not null, not class instance)
   */
  private isPlainObject(value: any): value is Record<string, any> {
    return (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) === Object.prototype
    );
  }
}
