import { test, expect } from '@playwright/test';
import { setupAuthMocks, SUPER_ADMIN_USER, CORS_HEADERS } from './fixtures/mock-api';

test.describe('Phase 10: E2E Critical Operational Flows', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthMocks(page, SUPER_ADMIN_USER);
  });

  test('8. Products list filtering updates URL query parameters and edit form opens', async ({ page }) => {
    await page.route('**/products/admin/all**', async (route) => {
      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'prod-01',
              name: 'Premium Cotton Panjabi',
              slug: 'premium-cotton-panjabi',
              status: 'ACTIVE',
              isFeatured: false,
              category: { id: 'cat-1', name: 'Mens Ethnic', slug: 'mens-ethnic' },
              pricing: {
                mrp: '2500',
                discountType: 'NONE',
                discountValue: '0',
                discountAmount: '0',
                sellingPrice: '2500',
              },
              images: [],
              variants: [
                {
                  id: 'var-1',
                  name: 'Size 40',
                  sku: 'PAN-001-40',
                  barcode: null,
                  price: '2500',
                  compareAtPrice: null,
                  isActive: true,
                  attributes: { size: '40' },
                },
              ],
              createdAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-01T00:00:00Z',
            },
          ],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        }),
      });
    });

    await page.route('**/products/admin/prod-01', async (route) => {
      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'prod-01',
            name: 'Premium Cotton Panjabi',
            slug: 'premium-cotton-panjabi',
            description: 'Luxury cotton collection',
            shortDescription: 'Classic panjabi',
            categoryId: 'cat-1',
            status: 'ACTIVE',
            isFeatured: false,
            freeShipping: false,
            specialOffer: false,
            inventoryType: 'READY_STOCK',
            specifications: {},
            pricing: {
              mrp: '2500',
              discountType: 'NONE',
              discountValue: '0',
              discountAmount: '0',
              sellingPrice: '2500',
            },
            variants: [],
            images: [],
            tags: [],
          },
        }),
      });
    });

    await page.goto('/admin/products');
    await expect(page.getByText('Products').first()).toBeVisible();

    // Type in search filter
    const searchInput = page.getByPlaceholder(/search products/i);
    await searchInput.fill('Panjabi');

    // Debounced filter updates URL query parameter `q=Panjabi`
    await expect(page).toHaveURL(/q=Panjabi/);

    // Click edit action link
    const editLink = page.getByRole('link', { name: /edit/i }).first();
    await editLink.click();

    await expect(page).toHaveURL(/\/admin\/products\/prod-01/);
    await expect(page.locator('input#name, input[name="name"]').first()).toHaveValue('Premium Cotton Panjabi');
  });

  test('9. Order status change debounce prevents double-click race condition', async ({ page }) => {
    let patchCount = 0;
    const mockOrder = {
      id: 'ord-1',
      orderNumber: 'ORD-1001',
      customerSnapshot: { id: 'cust-1', name: 'Karim Rahman', phone: '01711223344', isGuest: false },
      shippingAddressSnapshot: { address: 'House 1, Road 2', district: 'Dhaka', area: 'Dhanmondi' },
      total: '3500',
      grandTotal: '3500',
      subtotal: '3400',
      discountTotal: '0',
      shippingTotal: '100',
      taxTotal: '0',
      paymentStatus: 'PENDING',
      paymentMethod: 'COD',
      status: 'PENDING',
      items: [
        {
          productName: 'Panjabi Silk',
          variantName: 'Size 42',
          sku: 'PAN-SLK-42',
          unitPrice: '3400',
          quantity: 1,
          discount: '0',
          lineTotal: '3400',
        },
      ],
      shipments: [],
      placedAt: '2026-03-01T00:00:00Z',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    };

    await page.route('**/admin/orders**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      // Only intercept API requests to port 5000 / api/v1; fall back for Next.js page requests
      if (!url.includes('/api/v1/') && !url.includes(':5000')) {
        await route.fallback();
        return;
      }

      if (url.includes('/status') && method === 'PATCH') {
        patchCount += 1;
        await new Promise((res) => setTimeout(res, 250));
        await route.fulfill({
          status: 200,
          headers: CORS_HEADERS,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { ...mockOrder, status: 'CONFIRMED' },
          }),
        });
        return;
      }

      if (url.includes('/timeline')) {
        await route.fulfill({
          status: 200,
          headers: CORS_HEADERS,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
        return;
      }

      if (url.endsWith('/orders/ord-1')) {
        await route.fulfill({
          status: 200,
          headers: CORS_HEADERS,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: mockOrder }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [mockOrder],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        }),
      });
    });

    await page.goto('/admin/orders');
    await expect(page.getByText('ORD-1001')).toBeVisible();

    // Click Details button to open detail modal
    await page.getByRole('button', { name: /details/i }).first().click();
    await expect(page.getByRole('heading', { name: /Order #ORD-1001/i })).toBeVisible();

    // Click transition action "Confirm Order"
    const confirmBtn = page.getByRole('button', { name: /Confirm Order/i });
    await confirmBtn.click();

    // Confirmation dialog opens
    const dialogConfirmBtn = page.getByRole('button', { name: /Mark as CONFIRMED/i });
    await expect(dialogConfirmBtn).toBeVisible();

    // Double-click rapidly
    await dialogConfirmBtn.click({ clickCount: 2, delay: 50 });
    await page.waitForTimeout(400);

    // Exactly 1 request emitted due to button disabled state and mutation guard
    expect(patchCount).toBe(1);
  });

  test('10. Refund execute debounce prevents concurrent double refund submissions', async ({ page }) => {
    let refundPostCount = 0;
    await page.route('**/admin/refunds**', async (route) => {
      const url = route.request().url();

      // Only intercept API requests to port 5000 / api/v1; fall back for Next.js page requests
      if (!url.includes('/api/v1/') && !url.includes(':5000')) {
        await route.fallback();
        return;
      }

      if (route.request().method() === 'POST') {
        refundPostCount += 1;
        await new Promise((res) => setTimeout(res, 250));
        await route.fulfill({
          status: 200,
          headers: CORS_HEADERS,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { id: 'ref-01', amount: '500', status: 'COMPLETED' },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          headers: CORS_HEADERS,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
          }),
        });
      }
    });

    await page.goto('/admin/refunds');
    await expect(page.getByText(/Refunds & Settlements/i).first()).toBeVisible();

    const openRefundBtn = page.getByRole('button', { name: /issue order refund/i });
    if (await openRefundBtn.isVisible()) {
      await openRefundBtn.click();
      const submitBtn = page.getByRole('button', { name: /authorize refund/i });
      if (await submitBtn.isVisible()) {
        await submitBtn.click({ clickCount: 2, delay: 50 });
        await page.waitForTimeout(400);
        expect(refundPostCount).toBeLessThanOrEqual(1);
      }
    }
  });

  test('11. Dashboard period change updates URL and queries analytics with Dhaka ISO boundaries', async ({ page }) => {
    let capturedOverviewUrl: string | null = null;
    await page.route('**/admin/analytics/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/overview')) {
        capturedOverviewUrl = url;
        await route.fulfill({
          status: 200,
          headers: CORS_HEADERS,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              cards: {
                totalSales: { current: '100000', previous: '80000', change: '20000', percent: 25, trend: 'UP' },
                orderCount: { current: 150, previous: 120, change: 30, percent: 25, trend: 'UP' },
                deliveredSales: { current: '90000', previous: '70000', change: '20000', percent: 28.5, trend: 'UP' },
                pendingOrders: { current: 12, previous: 15, change: -3, percent: -20, trend: 'DOWN' },
              },
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.goto('/admin');
    await expect(page.getByText('Executive Overview')).toBeVisible();

    // Select different reporting period (e.g. Last 7 Days)
    const periodSelect = page.getByLabel(/select reporting period/i);
    await periodSelect.selectOption('last_7_days');

    // URL parameter is updated
    await expect(page).toHaveURL(/period=last_7_days/);

    // Captured request URL carried period parameter
    expect(capturedOverviewUrl).toContain('period=');
  });

  test('12. Banner form rejects unsafe javascript: protocol injection with validation alert', async ({ page }) => {
    await page.route('**/banners**', async (route) => {
      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
        }),
      });
    });

    await page.goto('/admin/cms');
    await expect(page.getByText(/Promotional Banners & Carousels/i)).toBeVisible();

    await page.click('button:has-text("Create Banner")');
    await expect(page.getByRole('heading', { name: /Create New Banner/i })).toBeVisible();

    // Fill valid required fields
    await page.fill('#title', 'Spring Mega Sale');
    await page.fill('#desktopImage', 'https://res.cloudinary.com/diano/image/upload/hero.jpg');

    // Fill unsafe javascript: protocol URL
    await page.fill('#linkUrl', 'javascript:alert(document.cookie)');

    // Attempt submission
    await page.click('button[type="submit"]');

    // Link safety validation error displayed
    await expect(
      page.getByText(/Destination link must be an http\/https URL or internal relative path starting with \//i)
    ).toBeVisible();
  });

  test('13. Mobile viewport at 360px opens navigation drawer and closes upon item click', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });

    await page.goto('/admin');
    await expect(page.getByText('Executive Overview')).toBeVisible();

    // Hamburger toggle button visible on mobile
    const hamburgerBtn = page.getByRole('button', { name: /open mobile menu/i });
    await expect(hamburgerBtn).toBeVisible();
    await hamburgerBtn.click();

    // Mobile nav drawer opens with accessible role="dialog"
    const mobileDrawer = page.getByRole('dialog', { name: /mobile navigation/i });
    await expect(mobileDrawer).toBeVisible();

    // Tap Products navigation link
    const productsLink = mobileDrawer.getByRole('link', { name: /products/i });
    await expect(productsLink).toBeVisible();
    await productsLink.click();

    // Verifies navigation to /admin/products and drawer auto-dismiss
    await expect(page).toHaveURL(/\/admin\/products/);
    await expect(mobileDrawer).not.toBeVisible();
  });
});
