import { ImageResponse } from 'next/og';
import { getSettings } from '@/lib/data';
import { initials } from '@/lib/site';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';
export const revalidate = 3600;

/** Ícone da aba do navegador: o monograma da logo. */
export default async function Icon() {
  const settings = await getSettings();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#202020',
          color: '#F3F0E8',
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: -2,
          position: 'relative',
        }}
      >
        {initials(settings.name)}
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 0,
            height: 0,
            borderLeft: '22px solid transparent',
            borderBottom: '22px solid #E66A3C',
          }}
        />
      </div>
    ),
    size,
  );
}
