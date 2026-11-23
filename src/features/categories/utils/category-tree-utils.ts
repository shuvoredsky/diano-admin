import type { CategoryItem } from '../types/categories.types';

/**
 * Returns a Set of all descendant category IDs recursively under a given category ID.
 */
export function getAllDescendantIds(targetId: string, categories: CategoryItem[]): Set<string> {
  const descendantIds = new Set<string>();
  const queue = [targetId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const cat of categories) {
      if (cat.parentId === currentId && !descendantIds.has(cat.id)) {
        descendantIds.add(cat.id);
        queue.push(cat.id);
      }
    }
  }

  return descendantIds;
}

/**
 * Returns the human-readable path of category names: "Men > Panjabi > Cotton"
 */
export function getCategoryPath(categoryId: string | null | undefined, categories: CategoryItem[]): string {
  if (!categoryId) return '';
  const map = new Map(categories.map((c) => [c.id, c]));
  const path: string[] = [];
  let curr = map.get(categoryId);
  const visited = new Set<string>();

  while (curr && !visited.has(curr.id)) {
    visited.add(curr.id);
    path.unshift(curr.name);
    curr = curr.parentId ? map.get(curr.parentId) : undefined;
  }

  return path.join(' > ');
}

export interface FlatCategoryOption {
  id: string;
  name: string;
  path: string;
  depth: number;
  disabled?: boolean;
}

/**
 * Builds a flat list of category options with full paths, optionally marking disabled categories.
 */
export function buildCategoryTreeOptions(
  categories: CategoryItem[],
  disabledIds?: Set<string>
): FlatCategoryOption[] {
  // Sort alphabetically by path or name
  return categories.map((cat) => {
    const path = getCategoryPath(cat.id, categories);
    return {
      id: cat.id,
      name: cat.name,
      path: path || cat.name,
      depth: cat.depth || (path.split('>').length),
      disabled: disabledIds ? disabledIds.has(cat.id) : false,
    };
  }).sort((a, b) => a.path.localeCompare(b.path));
}
