import { expect, test } from '@playwright/test';

test.describe('DIANO Admin Phase 1 E2E Smoke', () => {
  test('redirects unauthenticated /admin access to /login with returnUrl', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fadmin%2Fproducts/);
    await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
  });
});

