/** macOS-style arrow. `press` 0–1 scales to 0.94 on click. */
export function Cursor({ x, y, size = 1.6, press = 0, opacity = 1 }: { x: number; y: number; size?: number; press?: number; opacity?: number }) {
  const s = size * (1 - 0.06 * press);
  return (
    <svg
      width={24 * s}
      height={32 * s}
      viewBox="0 0 24 32"
      style={{ position: "absolute", left: x, top: y, opacity, overflow: "visible", filter: "drop-shadow(0 2px 3px rgb(23 33 28 / 0.25))" }}
    >
      <path d="M1 1 L1 23.5 L6.6 18.3 L10.3 27 L14 25.4 L10.4 16.9 L18 16.9 Z" fill="#000" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
