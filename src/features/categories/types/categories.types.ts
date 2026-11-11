export interface SpecificationField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number';
  required: boolean;
  options?: string[];
  sortOrder: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  depth?: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  productCount?: number;
  children?: CategoryItem[];
  specificationTemplate?: SpecificationField[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ReorderCategoryItem {
  id: string;
  sortOrder: number;
}

