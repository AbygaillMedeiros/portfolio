import { ImageResponse } from 'next/og';
import { getSettings } from '@/lib/data';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'A arte não termina na tela.';
export const revalidate = 3600;

/** Imagem de compartilhamento (WhatsApp, LinkedIn etc.). */
export default async function OgImage() {
  const settings = await getSettings();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#F3F0E8',
          color: '#202020',
          padding: 72,
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, color: '#64625D' }}>
          {settings.name} / {settings.role_line}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 104, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4 }}>
            A arte não termina
          </div>
          <div style={{ display: 'flex', fontSize: 104, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4 }}>
            na tela.
          </div>
        </div>
        <div style={{ display: 'flex', height: 10, width: '100%', background: '#E66A3C' }} />
      </div>
    ),
    size,
  );
}
