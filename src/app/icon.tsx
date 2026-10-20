import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/** Ícone da aba do navegador: o símbolo AM sobre o quadrado grafite. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#202020' }}>
        <svg width="64" height="64" viewBox="0 0 60 60">
          <g transform="translate(12 20)">
            <path fill="#F2F0E7" d="M0 20 L8 0 L12 0 L18 15 L24 0 L28 0 L36 20 L32 20 L26 5 L20 20 L16 20 L10 5 L4 20 Z" />
            <path fill="#E66A3C" d="M7.2 12 L12.8 12 L14 15 L6 15 Z" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
