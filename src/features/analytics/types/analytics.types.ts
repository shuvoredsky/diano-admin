export type AnalyticsPeriod =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'
  | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export interface KpiCardData<T = number> {
  current: T | null;
  previous: T | null;
  change: number | null;
  percent: number | null;
  trend: 'UP' | 'DOWN' | 'FLAT' | 'NONE';
  unit?: 'currency' | 'percent' | 'count';
  note?: string;
}

export interface AnalyticsOverviewData {
  period: AnalyticsPeriod;
  range: DateRange;
  comparisonRange: DateRange;
  cards: {
    grossSales: KpiCardData<number>;
    netSales: KpiCardData<number>;
    deliveredSales: KpiCardData<number>;
    totalOrders: KpiCardData<number>;
    aov: KpiCardData<number>;
    itemsSold: KpiCardData<number>;
    cancellationRate: KpiCardData<number>;
    returnRate: KpiCardData<number>;
    customerCount: KpiCardData<number>;
    repeatCustomerRate: KpiCardData<number>;
    grossProfit: KpiCardData<number> | null;
    netProfit: KpiCardData<number> | null;
    undeliveredOrdersCount: KpiCardData<number>;
  };
}

export interface SalesTrendPoint {
  bucket: string;
  grossSales: number;
  netSales: number;
}

export interface OrderStatusPoint {
  bucket: string;
  count: number;
}

export interface ShipmentStatusPoint {
  bucket: string;
  status: string;
  count: number;
  percent: number;
}

export interface StockBySubcategoryPoint {
  bucket: string;
  categoryId: string;
  categoryName: string;
  parentCategoryId: string | null;
  parentCategoryName: string | null;
  onHandUnits: number;
  availableUnits: number;
  damagedUnits: number;
}

export interface TopProductItem {
  productId: string;
  variantId?: string;
  productName: string;
  sku: string;
  quantitySold: number;
  revenue: number;
}

export interface AnalyticsProductsData {
  period: AnalyticsPeriod;
  top10SellingByQty: TopProductItem[];
  top10SellingByRevenue: TopProductItem[];
}

export interface LowStockItem {
  id: string;
  sku: string;
  name: string;
  onHand: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
}

export interface RecentOrderItem {
  id: string;
  orderNumber: string;
  customerName?: string;
  status: string;
  paymentMethod: string;
  grandTotal: number;
  placedAt: string;
}

