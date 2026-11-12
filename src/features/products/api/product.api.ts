export * from './products.api';
import { fetchAdminProducts, fetchAdminProductById } from './products.api';

/**
 * @deprecated Use fetchAdminProducts instead
 */
export const getAdminProducts = fetchAdminProducts;

/**
 * @deprecated Use fetchAdminProductById instead
 */
export const getAdminProductById = fetchAdminProductById;
