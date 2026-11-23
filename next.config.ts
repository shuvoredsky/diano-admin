import type { NextConfig } from 'next';

function getConnectSources(): string {
  const sources = [
    "'self'",
    'https://res.cloudinary.com',
    'http://localhost:*',
    'ws://localhost:*',
    'wss://localhost:*',
  ];

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      sources.push(new URL(process.env.NEXT_PUBLIC_API_URL).origin);
    } catch {
      // ignore invalid URLs in build/test
    }
  }

  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    try {
      sources.push(new URL(process.env.NEXT_PUBLIC_SOCKET_URL).origin);
    } catch {
      // ignore invalid URLs in build/test
    }
  }

  return Array.from(new Set(sources)).join(' ');
}

const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://res.cloudinary.com http://localhost:* http://127.0.0.1:*;
  font-src 'self' data:;
  connect-src ${getConnectSources()};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`
  .replace(/\s{2,}/g, ' ')
  .trim();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
