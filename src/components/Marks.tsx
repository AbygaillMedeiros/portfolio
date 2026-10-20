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

/**
 * Logo completa: o símbolo (monograma) + o nome + o descritor.
 * As iniciais saem do nome cadastrado no painel, então a logo
 * se atualiza sozinha quando o nome muda.
 */
export function Logo({
  name,
  mono,
  descriptor,
  size = 34,
}: {
  name: string;
  mono: string;
  descriptor?: string;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-3">
      <Monogram text={mono} size={size} />
      <span className="flex flex-col leading-none">
        <span
          className="font-bold tracking-tight"
          style={{ fontVariationSettings: "'wdth' 112", fontSize: size * 0.46 }}
        >
          {name}
        </span>
        {descriptor && <span className="slug mt-1 hidden sm:block">{descriptor}</span>}
      </span>
    </span>
  );
}

/** Monograma: as iniciais numa folha grafite com o canto em hachura laranja. */
export function Monogram({ text, size = 40 }: { text: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-ink text-paper"
      style={{ width: size, height: size }}
    >
      <span
        className="display relative z-10"
        style={{ fontSize: size * 0.42, letterSpacing: '-0.04em', lineHeight: 1 }}
      >
        {text}
      </span>
      <span
        className="absolute -right-1 bottom-0 h-1/2 w-1/2 hatch-accent"
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
      />
    </span>
  );
}
