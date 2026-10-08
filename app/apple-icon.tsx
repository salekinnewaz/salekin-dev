import { ImageResponse } from 'next/og';

// Route: app/apple-icon.tsx → /apple-icon (180x180 iOS home screen).
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, rgb(167, 139, 250) 0%, rgb(34, 211, 238) 100%)',
          color: 'rgb(11, 11, 16)',
          fontSize: 96,
          fontWeight: 800,
          fontFamily: 'ui-monospace, Menlo, monospace',
          letterSpacing: '-0.04em',
          clipPath:
            'polygon(22% 0, 100% 0, 100% 78%, 78% 100%, 0 100%, 0 22%)',
        }}
      >
        SN
      </div>
    ),
    { ...size },
  );
}
