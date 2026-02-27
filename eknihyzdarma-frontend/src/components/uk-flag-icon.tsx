export function UKFlagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}
      aria-label="UK"
    >
      {/* Modrý základ */}
      <rect width="60" height="60" fill="#012169" />
      {/* Bílý saltire (St. Andrew + St. Patrick) */}
      <line x1="0" y1="0" x2="60" y2="60" stroke="white" strokeWidth="13" />
      <line x1="60" y1="0" x2="0" y2="60" stroke="white" strokeWidth="13" />
      {/* Červený saltire */}
      <line x1="0" y1="0" x2="60" y2="60" stroke="#C8102E" strokeWidth="8" />
      <line x1="60" y1="0" x2="0" y2="60" stroke="#C8102E" strokeWidth="8" />
      {/* Bílý kříž (St. George) */}
      <line x1="30" y1="0" x2="30" y2="60" stroke="white" strokeWidth="20" />
      <line x1="0" y1="30" x2="60" y2="30" stroke="white" strokeWidth="20" />
      {/* Červený kříž */}
      <line x1="30" y1="0" x2="30" y2="60" stroke="#C8102E" strokeWidth="12" />
      <line x1="0" y1="30" x2="60" y2="30" stroke="#C8102E" strokeWidth="12" />
    </svg>
  );
}
