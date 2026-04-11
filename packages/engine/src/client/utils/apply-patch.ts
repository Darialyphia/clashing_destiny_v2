import type { PatchOperation } from '../../game/systems/patch-types';

/**
 * Applies a JSON Patch operation to a data object in place.
 * Handles replace, add, and remove operations with support for:
 * - Simple paths: 'atk'
 * - Nested paths: 'art.tint'
 * - Array paths: 'modifiers[2]'
 */
export function applyPatchToData(data: Record<string, any>, patch: PatchOperation): void {
  const { path } = patch;

  // Parse path into segments, handling array indices like 'modifiers[2]'
  const segments = parsePath(path);

  if (segments.length === 0) return;

  // Navigate to the parent of the target
  let current = data;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (current[segment.key] === undefined) {
      if (patch.op === 'remove') return; // Nothing to remove
      current[segment.key] = segment.isArray ? [] : {};
    }
    current = current[segment.key];

    // If this segment has an array index, navigate into the array
    if (segment.index !== undefined) {
      if (!Array.isArray(current)) return;
      if (current[segment.index] === undefined) {
        if (patch.op === 'remove') return;
        current[segment.index] = {};
      }
      current = current[segment.index];
    }
  }

  const lastSegment = segments[segments.length - 1];
  const key = lastSegment.key;
  const index = lastSegment.index;

  switch (patch.op) {
    case 'replace':
    case 'add':
      if (index !== undefined) {
        // Array operation
        if (!Array.isArray(current[key])) {
          current[key] = [];
        }
        if (index === -1) {
          // Append to array (modifiers[-])
          current[key].push(patch.value);
        } else {
          current[key].splice(index, 0, patch.value);
        }
      } else {
        current[key] = patch.value;
      }
      break;

    case 'remove':
      if (index !== undefined) {
        // Array element removal
        if (Array.isArray(current[key]) && index >= 0 && index < current[key].length) {
          current[key].splice(index, 1);
        }
      } else {
        delete current[key];
      }
      break;
  }
}

interface PathSegment {
  key: string;
  index?: number;
  isArray?: boolean;
}

/**
 * Parses a patch path into segments.
 * Examples:
 * - 'atk' => [{ key: 'atk' }]
 * - 'art.tint' => [{ key: 'art' }, { key: 'tint' }]
 * - 'modifiers[2]' => [{ key: 'modifiers', index: 2, isArray: true }]
 * - 'modifiers[-]' => [{ key: 'modifiers', index: -1, isArray: true }]
 */
function parsePath(path: string): PathSegment[] {
  const parts = path.split('.');
  return parts.map(part => {
    const arrayMatch = part.match(/^(.+)\[(-|\d+)\]$/);
    if (arrayMatch) {
      const key = arrayMatch[1];
      const indexStr = arrayMatch[2];
      const index = indexStr === '-' ? -1 : parseInt(indexStr, 10);
      return { key, index, isArray: true };
    }
    return { key: part };
  });
}
