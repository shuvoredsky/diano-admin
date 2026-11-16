import { test, expect } from '@playwright/test';
import { setupAuthMocks, SUPER_ADMIN_USER, LIMITED_STAFF_USER } from './fixtures/mock-api';

test.describe('Phase 10: E2E Auth & Access Control Flows', () => {
  test('1. Successful login authenticates user and redirects to /admin dashboard', async ({ page }) => {
    await setupAuthMocks(page, null);

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /DIANO Admin Portal/i })).toBeVisible();

    await page.fill('#email', 'admin@diano.com.bd');
    await page.fill('#password', 'SuperSecret@123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText('DIANO').first()).toBeVisible();
    await expect(page.getByText('Super Administrator')).toBeVisible();
  });

  test('2. Invalid credentials displays backend failure message', async ({ page }) => {
    await setupAuthMocks(page, null);

    await page.goto('/login');
    await page.fill('#email', 'bad@diano.com.bd');
    await page.fill('#password', 'WrongPass123!');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('3. Account lockout displays 403 structured lockout message', async ({ page }) => {
    await setupAuthMocks(page, null);

    await page.goto('/login');
    await page.fill('#email', 'locked@diano.com.bd');
    await page.fill('#password', 'AnyPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/Account is temporarily locked/i)).toBeVisible();
  });

  test('4. Session persistence on page refresh retains authenticated user', async ({ page }) => {
    await setupAuthMocks(page, SUPER_ADMIN_USER);

    await page.goto('/admin');
    await expect(page.getByText('Super Administrator')).toBeVisible();

    // Reload page
    await page.reload();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText('Super Administrator')).toBeVisible();
  });

  test('5. Logout revokes session and redirects to /login', async ({ page }) => {
    await setupAuthMocks(page, SUPER_ADMIN_USER);

    await page.goto('/admin');
    await expect(page.getByText('Super Administrator')).toBeVisible();

    // Open profile menu and click Log Out
    await page.click('button[aria-label="User profile menu"]');
    await page.click('button:has-text("Log Out")');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /DIANO Admin Portal/i })).toBeVisible();
  });

  test('6. Protected route redirects with returnTo and open-redirect is rejected', async ({ page }) => {
    await setupAuthMocks(page, null);

    // Unauthenticated access redirects with returnTo
    await page.goto('/admin/orders');
    await expect(page).toHaveURL(/\/login\?returnTo=%2Fadmin%2Forders/);

    // Open redirect attempt with protocol-relative URL is sanitized to /admin
    await page.goto('/login?returnTo=%2F%2Fevil.com');
    await page.fill('#email', 'admin@diano.com.bd');
    await page.fill('#password', 'SuperSecret@123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin/);
    expect(page.url()).not.toContain('evil.com');
  });

  test('7. Permission-filtered nav hides sensitive items and forbidden URL displays 403', async ({ page }) => {
    await setupAuthMocks(page, LIMITED_STAFF_USER);

    await page.goto('/admin/products');
    await expect(page.getByText('Products').first()).toBeVisible();

    // Limited staff has product:read, product:update only
    await expect(page.getByRole('link', { name: /products/i })).toBeVisible();

    // Sensitive modules must NOT be visible in navigation
    await expect(page.getByRole('link', { name: /staff/i })).not.toBeVisible();
    await expect(page.getByRole('link', { name: /roles & permissions/i })).not.toBeVisible();
    await expect(page.getByRole('link', { name: /audit logs/i })).not.toBeVisible();

    // Direct navigation to restricted route displays 403 Forbidden screen
    await page.goto('/admin/staff');
    await expect(page.getByText(/403 — Unauthorized Section/i)).toBeVisible();
  });
});
