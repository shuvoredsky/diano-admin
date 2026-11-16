import type { Page, Route } from '@playwright/test';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
}

export const SUPER_ADMIN_USER: MockUser = {
  id: 'usr-admin-1',
  email: 'admin@diano.com.bd',
  name: 'Super Administrator',
  roles: ['super-admin'],
  permissions: ['*'],
  isSuperAdmin: true,
};

export const LIMITED_STAFF_USER: MockUser = {
  id: 'usr-staff-2',
  email: 'staff@diano.com.bd',
  name: 'Catalog Staff',
  roles: ['catalog-editor'],
  permissions: ['product:read', 'product:update'],
  isSuperAdmin: false,
};

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'http://localhost:3001',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Idempotency-Key, x-request-id',
};

export async function setupAuthMocks(page: Page, user: MockUser | null = SUPER_ADMIN_USER) {
  let currentUser = user;

  // Manage cookie for Next.js proxy.ts optimistic check
  if (currentUser) {
    await page.context().addCookies([
      {
        name: 'diano_refresh_token',
        value: 'mock_valid_refresh_token',
        url: 'http://localhost:3001',
      },
    ]);
  } else {
    await page.context().clearCookies();
  }

  // Intercept all OPTIONS preflight requests for backend APIs
  await page.route('**/*', async (route: Route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: CORS_HEADERS,
      });
      return;
    }
    await route.fallback();
  });

  // 1. Intercept current user profile endpoint (/auth/me and /api/v1/auth/me)
  await page.route('**/auth/me**', async (route: Route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }

    if (!currentUser) {
      await route.fulfill({
        status: 401,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Unauthenticated' }),
      });
    } else {
      await route.fulfill({
        status: 200,
        headers: CORS_HEADERS,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: currentUser,
          ...currentUser,
        }),
      });
    }
  });

  // 2. Intercept silent token refresh via BFF (/api/auth/refresh)
  await page.route('**/api/auth/refresh', async (route: Route) => {
    if (!currentUser) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Session expired' }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Set-Cookie': 'diano_refresh_token=mock_valid_refresh_token; Path=/; HttpOnly; SameSite=Lax',
        },
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: 'mock_refreshed_jwt_token',
            user: currentUser,
          },
        }),
      });
    }
  });

  // 3. Intercept login via BFF (/api/auth/admin/login)
  await page.route('**/api/auth/**', async (route: Route) => {
    const url = route.request().url();

    if (url.includes('/login')) {
      const postData = route.request().postDataJSON();
      const email = postData?.email?.toLowerCase();
      const password = postData?.password;

      if (email === 'locked@diano.com.bd') {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Account is temporarily locked due to excessive failed attempts. Try again in 15 minute(s).',
          }),
        });
        return;
      }

      if (email === 'bad@diano.com.bd' || password === 'WrongPass123!') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Invalid email or password',
          }),
        });
        return;
      }

      currentUser = SUPER_ADMIN_USER;
      // Add cookie into page context
      await page.context().addCookies([
        {
          name: 'diano_refresh_token',
          value: 'mock_valid_refresh_token',
          url: 'http://localhost:3001',
        },
      ]);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Set-Cookie': 'diano_refresh_token=mock_valid_refresh_token; Path=/; HttpOnly; SameSite=Lax',
        },
        body: JSON.stringify({
          success: true,
          data: {
            accessToken: 'mock_jwt_access_token',
            user: SUPER_ADMIN_USER,
          },
        }),
      });
      return;
    }

    if (url.includes('/logout')) {
      currentUser = null;
      await page.context().clearCookies();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Set-Cookie': 'diano_refresh_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
        },
        body: JSON.stringify({ success: true }),
      });
      return;
    }

    await route.fallback();
  });

  // 4. Default background queries (Notifications, Analytics, Categories)
  await page.route('**/notifications**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      headers: CORS_HEADERS,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { notifications: [], total: 0, unreadCount: 0 },
      }),
    });
  });

  await page.route('**/categories/admin/all', async (route: Route) => {
    await route.fulfill({
      status: 200,
      headers: CORS_HEADERS,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [{ id: 'cat-1', name: 'Mens Ethnic', slug: 'mens-ethnic', children: [] }],
      }),
    });
  });

  await page.route('**/inventory/summary', async (route: Route) => {
    await route.fulfill({
      status: 200,
      headers: CORS_HEADERS,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { totalSKUs: 10, totalStock: 100, lowStockCount: 0, outOfStockCount: 0 },
      }),
    });
  });

  await page.route('**/inventory/low-stock**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      headers: CORS_HEADERS,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { items: [], total: 0 } }),
    });
  });

  return {
    setCurrentUser: (u: MockUser | null) => {
      currentUser = u;
    },
  };
}
