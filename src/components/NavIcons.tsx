// Icônes de navigation : SVG simples dessinés à la main (pas de dépendance
// supplémentaire), trait `currentColor` pour suivre la couleur du texte
// (état actif/inactif, clair/sombre) sans prop de couleur séparée.

type IconProps = { className?: string };

const COMMON = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconAujourdhui({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...COMMON}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9.5h13V10" />
      <path d="M9.5 19.5V14h5v5.5" />
    </svg>
  );
}

export function IconPipeline({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...COMMON}>
      <rect x="3" y="4" width="5" height="16" rx="1.2" />
      <rect x="9.5" y="4" width="5" height="10.5" rx="1.2" />
      <rect x="16" y="4" width="5" height="13.5" rx="1.2" />
    </svg>
  );
}

export function IconMaquettes({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...COMMON}>
      <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
      <path d="M8.5 20h7M12 16.5V20" />
    </svg>
  );
}

export function IconMessages({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...COMMON}>
      <path d="M4 5.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4.5 3.5V16.5H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function IconStatistiques({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...COMMON}>
      <line x1="4" y1="20" x2="4" y2="11" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="20" y1="20" x2="20" y2="14" />
    </svg>
  );
}

export function IconParametres({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...COMMON}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="9.5" cy="6" r="2" fill="currentColor" stroke="none" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="11" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
