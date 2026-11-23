import { describe, expect, it } from 'vitest';
import { getAllDescendantIds, getCategoryPath, buildCategoryTreeOptions } from '@/features/categories/utils/category-tree-utils';
import type { CategoryItem } from '@/features/categories/types/categories.types';

const mockCategories: CategoryItem[] = [
  {
    id: 'root-1',
    name: 'Men',
    slug: 'men',
    parentId: null,
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'l2-1',
    name: 'Clothing',
    slug: 'clothing',
    parentId: 'root-1',
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'l3-1',
    name: 'Panjabi',
    slug: 'panjabi',
    parentId: 'l2-1',
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'l4-1',
    name: 'Cotton',
    slug: 'cotton',
    parentId: 'l3-1',
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'l5-1',
    name: 'Handloom',
    slug: 'handloom',
    parentId: 'l4-1',
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'root-2',
    name: 'Women',
    slug: 'women',
    parentId: null,
    isActive: true,
    isFeatured: false,
    sortOrder: 1,
    createdAt: '',
    updatedAt: '',
  },
];

describe('Category Tree Utilities (Deep Tree & Cycle Prevention)', () => {
  it('correctly resolves full category path at any depth', () => {
    expect(getCategoryPath('root-1', mockCategories)).toBe('Men');
    expect(getCategoryPath('l3-1', mockCategories)).toBe('Men > Clothing > Panjabi');
    expect(getCategoryPath('l5-1', mockCategories)).toBe('Men > Clothing > Panjabi > Cotton > Handloom');
  });

  it('recursively gathers all descendant IDs for a category to prevent cycles', () => {
    // Under Clothing (l2-1): Panjabi (l3-1), Cotton (l4-1), Handloom (l5-1)
    const descendants = getAllDescendantIds('l2-1', mockCategories);
    expect(descendants.has('l3-1')).toBe(true);
    expect(descendants.has('l4-1')).toBe(true);
    expect(descendants.has('l5-1')).toBe(true);
    expect(descendants.has('root-1')).toBe(false);
    expect(descendants.has('root-2')).toBe(false);
  });

  it('builds flat category options and disables self + all descendants when editing', () => {
    const editingId = 'l3-1'; // Panjabi
    const disabledIds = getAllDescendantIds(editingId, mockCategories);
    disabledIds.add(editingId);

    const options = buildCategoryTreeOptions(mockCategories, disabledIds);

    const panjabiOpt = options.find((o) => o.id === 'l3-1');
    const cottonOpt = options.find((o) => o.id === 'l4-1');
    const handloomOpt = options.find((o) => o.id === 'l5-1');
    const clothingOpt = options.find((o) => o.id === 'l2-1');
    const womenOpt = options.find((o) => o.id === 'root-2');

    expect(panjabiOpt?.disabled).toBe(true); // Self disabled
    expect(cottonOpt?.disabled).toBe(true);  // Child disabled
    expect(handloomOpt?.disabled).toBe(true);// Grandchild disabled
    expect(clothingOpt?.disabled).toBe(false); // Valid parent
    expect(womenOpt?.disabled).toBe(false);    // Valid parent
  });
});
