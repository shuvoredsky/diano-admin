export interface FlashSaleItemEntity {
  id: string;
  flashSaleId: string;
  variantId: string;
  discountPrice: string;
  stockLimit: number;
  soldCount: number;
  variant?: {
    id: string;
    sku: string;
    name?: string;
    product?: {
      id: string;
      name: string;
    };
  };
}

export interface FlashSaleEntity {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items?: FlashSaleItemEntity[];
}

export interface CreateFlashSaleItemInput {
  variantId: string;
  discountPrice: string | number;
  stockLimit: number;
}

export interface CreateFlashSaleInput {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
  items: CreateFlashSaleItemInput[];
}

