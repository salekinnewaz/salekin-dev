import { ImageResponse } from 'next/og';

// Route: app/icon.tsx → /icon (favicon). Next picks the file-based URL.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          fontSize: 18,
          fontWeight: 800,
          fontFamily: 'ui-monospace, Menlo, monospace',
          letterSpacing: '-0.04em',
          // Approximate the chamfered square by clipping a corner triangle
          // from each of the 4 corners. 32x32 grid: ~7px corner cut.
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
