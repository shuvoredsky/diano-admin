export type PageType = 'CUSTOM' | 'LEGAL' | 'INFORMATIONAL';
export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface RichTextBlock {
  type: 'richText';
  html: string;
}

export interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export type PageBlock = RichTextBlock | HeadingBlock | Record<string, unknown>;

export interface PageEntity {
  id: string;
  slug: string;
  type: PageType;
  title: string;
  content: PageBlock[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  status: PageStatus;
  currentVersion: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageRevisionEntity {
  id: string;
  pageId: string;
  version: number;
  title: string;
  content: PageBlock[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  createdAt: string;
  createdById?: string | null;
}

export interface CreatePageInput {
  slug: string;
  title: string;
  type?: PageType;
  content?: PageBlock[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  status?: PageStatus;
}

export interface UpdatePageInput {
  title?: string;
  type?: PageType;
  content?: PageBlock[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  status?: PageStatus;
}

export interface PageFilterParams {
  type?: PageType;
  status?: PageStatus;
  search?: string;
  page?: number;
  limit?: number;
}
