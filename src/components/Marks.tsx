/**
 * Elementos gráficos da marca, tirados do vocabulário da gráfica:
 * marcas de corte, marca de registro e hachura.
 */

type TrimProps = { className?: string; color?: string; size?: number; gap?: number };

/** Marcas de corte nos quatro cantos do elemento pai (que deve ser relative). */
export function TrimMarks({ className = '', color = 'var(--ink)', size = 18, gap = 6 }: TrimProps) {
  const s = size;
  const o = -(s + gap);
  return (
    <span aria-hidden="true" className={className}>
      <TrimCorner s={s} gap={gap} color={color} style={{ top: o, left: o }} d={`M0 ${s + gap - 0.5}H${s} M${s + gap - 0.5} 0V${s}`} />
      <TrimCorner s={s} gap={gap} color={color} style={{ top: o, right: o }} d={`M${gap} ${s + gap - 0.5}H${s + gap} M0.5 0V${s}`} />
      <TrimCorner s={s} gap={gap} color={color} style={{ bottom: o, left: o }} d={`M0 0.5H${s} M${s + gap - 0.5} ${gap}V${s + gap}`} />
      <TrimCorner s={s} gap={gap} color={color} style={{ bottom: o, right: o }} d={`M${gap} 0.5H${s + gap} M0.5 ${gap}V${s + gap}`} />
    </span>
  );
}

function TrimCorner({
  s,
  gap,
  color,
  style,
  d,
}: {
  s: number;
  gap: number;
  color: string;
  style: React.CSSProperties;
  d: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={style}
      width={s + gap}
      height={s + gap}
      viewBox={`0 0 ${s + gap} ${s + gap}`}
      fill="none"
      stroke={color}
      strokeWidth="1"
    >
      <path d={d} />
    </svg>
  );
}

/** Marca de registro (o alvo usado para alinhar as cores na impressão). */
export function RegMark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <circle cx="11" cy="11" r="6" />
      <circle cx="11" cy="11" r="2.5" fill="currentColor" stroke="none" />
      <path d="M11 0v22M0 11h22" />
    </svg>
  );
}

/** Desenho do monograma AM (módulo: altura 20, haste 4, inclinação 8:20). */
const AM_BODY = 'M0 20 L8 0 L12 0 L18 15 L24 0 L28 0 L36 20 L32 20 L26 5 L20 20 L16 20 L10 5 L4 20 Z';
const AM_BAR = 'M7.2 12 L12.8 12 L14 15 L6 15 Z';

/**
 * Logo completa: o símbolo AM + o nome + o descritor.
 * O símbolo usa a cor do texto (grafite no tema claro, areia no escuro)
 * e a travessa sempre em laranja.
 */
export function Logo({
  name,
  descriptor,
  size = 22,
}: {
  name: string;
  mono?: string;
  descriptor?: string;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center" style={{ gap: size * 0.45 }}>
      <Monogram size={size} />
      <span className="flex flex-col leading-none">
        <span className="font-extrabold" style={{ fontSize: 15, letterSpacing: '-0.02em' }}>
          {name}
        </span>
        {descriptor && <span className="slug mt-1 hidden sm:block">{descriptor}</span>}
      </span>
    </span>
  );
}

/** Símbolo AM. `size` é a altura em px; a largura segue a proporção 9:5. */
export function Monogram({ size = 22 }: { text?: string; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 36 20"
      width={size * 1.8}
      height={size}
      className="shrink-0"
    >
      <path d={AM_BODY} fill="currentColor" />
      <path d={AM_BAR} fill="var(--accent)" />
    </svg>
  );
}
