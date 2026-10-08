import { ImageResponse } from 'next/og';
import { getSiteSettings } from '@/lib/queries/site';

// Route: app/opengraph-image.tsx → /opengraph-image
// Also exposed via /og in next.config? Easier: use the default route.
// We export two — Next picks the file-based URL (/opengraph-image).

export const alt = 'Md Salekin Newaz — Senior Software QA Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'nodejs';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m || !m[1]) return null;
  const v = m[1];
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

function mixRgb(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
): string {
  const r = Math.round(a.r * (1 - t) + b.r * t);
  const g = Math.round(a.g * (1 - t) + b.g * t);
  const bl = Math.round(a.b * (1 - t) + b.b * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

export default async function Image() {
  const site = await getSiteSettings();
  const title = site.identity.siteTitle || 'Md Salekin Newaz';
  const tagline =
    site.identity.siteTagline ||
    'Building quality infrastructure that enables engineering teams to release with confidence.';
  const subtitle =
    site.identity.siteSubtitle ||
    'Senior Software QA Engineer @ Brain Station 23 · ISTQB® Certified';
  const initials = (site.identity.siteInitials || 'SN').slice(0, 2).toUpperCase();

  const accent = hexToRgb(site.theme.accentColor) ?? { r: 167, g: 139, b: 250 };
  const accent2 = hexToRgb(site.theme.accentColor2) ?? { r: 34, g: 211, b: 238 };
  const bg = { r: 7, g: 7, b: 10 };
  const fg = { r: 244, g: 244, b: 238 };
  const muted = { r: 138, g: 138, b: 130 };

  const gradientCss = `linear-gradient(135deg, rgb(${accent.r}, ${accent.g}, ${accent.b}) 0%, rgb(${accent2.r}, ${accent2.g}, ${accent2.b}) 100%)`;
  const ringColor = mixRgb(accent, accent2, 0.5);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `rgb(${bg.r}, ${bg.g}, ${bg.b})`,
          color: `rgb(${fg.r}, ${fg.g}, ${fg.b})`,
          fontFamily: 'sans-serif',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Mesh blobs (positioned absolute) */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: -120,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background: `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.45)`,
            filter: 'blur(120px)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -160,
            right: -160,
            width: 700,
            height: 700,
            borderRadius: 9999,
            background: `rgba(${accent2.r}, ${accent2.g}, ${accent2.b}, 0.4)`,
            filter: 'blur(140px)',
            display: 'flex',
          }}
        />

        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              color: `rgb(${accent.r}, ${accent.g}, ${accent.b})`,
              fontSize: 22,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: gradientCss,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: `rgb(${bg.r}, ${bg.g}, ${bg.b})`,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            salekin.dev
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              color: `rgb(${muted.r}, ${muted.g}, ${muted.b})`,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Portfolio · 2025
          </div>
        </div>

        {/* Main */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            marginTop: 'auto',
            marginBottom: 'auto',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 1,
              color: `rgb(${fg.r}, ${fg.g}, ${fg.b})`,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 36,
              fontWeight: 500,
              color: `rgb(${muted.r}, ${muted.g}, ${muted.b})`,
              maxWidth: 1000,
            }}
          >
            {tagline}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 12,
              fontSize: 22,
              color: ringColor,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginTop: 16,
            }}
          >
            <span>●</span>
            {subtitle}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            color: `rgb(${muted.r}, ${muted.g}, ${muted.b})`,
            fontSize: 20,
          }}
        >
          <div style={{ display: 'flex' }}>
            {site.identity.contactEmail ?? ''}
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {site.identity.socialGithub ? <span>GitHub</span> : null}
            {site.identity.socialLinkedin ? <span>LinkedIn</span> : null}
            {site.identity.socialFacebook ? <span>Facebook</span> : null}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}