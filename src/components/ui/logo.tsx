export function PathPilotLogo({ className }: { className?: string }) {
  return (
    <svg
      width="140"
      height="28"
      viewBox="0 0 140 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PathPilot"
    >
      {/* Faint baseline */}
      <line x1="0" y1="14" x2="44" y2="14" stroke="currentColor" strokeWidth="0.5" opacity="0.25"/>
      {/* Wave path connecting stars */}
      <path
        d="M 2,14 C 4,10 8,7 11,7 C 14,7 17,21 20,21 C 23,21 26,9 29,9 C 32,9 35,16 38,16 C 40,15.5 42,14 46,14"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.2"
        strokeLinecap="round"
      />
      {/* Small stars along wave */}
      <circle cx="2" cy="14" r="1.6" fill="currentColor"/>
      <circle cx="11" cy="7" r="1.2" fill="currentColor"/>
      <circle cx="20" cy="21" r="1.2" fill="currentColor"/>
      <circle cx="29" cy="9" r="1.2" fill="currentColor"/>
      <circle cx="38" cy="16" r="1.4" fill="currentColor"/>
      {/* North star */}
      <circle cx="46" cy="14" r="3.2" fill="currentColor"/>
      <circle cx="46" cy="14" r="5" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
      {/* Wordmark */}
      <text
        x="56"
        y="19"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="14"
        fontWeight="600"
        fill="currentColor"
        letterSpacing="-0.4"
      >Path</text>
      <text
        x="86"
        y="19"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="14"
        fontWeight="300"
        fill="currentColor"
        letterSpacing="-0.4"
      >Pilot</text>
    </svg>
  )
}
