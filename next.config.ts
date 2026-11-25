import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // CSP: in production we only need 'self' + 'unsafe-inline' for the head
  // boot script. In dev, Next.js webpack uses eval() to evaluate modules
  // (HMR + sourceURL trickery); without 'unsafe-eval' the entire client
  // bundle fails to bootstrap, which manifests as a totally non-functional
  // page (no theme, no nav highlights, no clicks do anything).
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob:",
      // dev needs ws: for HMR socket; prod does not.
      isDev
        ? "connect-src 'self' ws: wss:"
        : "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next.js caps a Server Action request body at 1 MB by default. The
  // admin panel's portrait upload accepts up to 3 MB (see
  // MAX_IMAGE_BYTES in lib/actions/profile-image.ts), so without this
  // the limit is unreachable — the platform rejects the request with a
  // bare 413 before the action's own validation can produce a readable
  // message.
  //
  // 4 MB leaves room for the multipart envelope (boundaries, headers)
  // on top of a 3 MB file. The hosting platform's own ceiling is about
  // 4.5 MB, so this stays under it.
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  // No URL redirects — `app/opengraph-image.tsx` is the single source
  // of truth and is referenced directly from `metadata.openGraph.images`
  // and `metadata.twitter.images` in `app/layout.tsx`.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          ...securityHeaders,
          // HSTS only makes sense over HTTPS; safe to set unconditionally
          // because browsers ignore it on plain HTTP.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;