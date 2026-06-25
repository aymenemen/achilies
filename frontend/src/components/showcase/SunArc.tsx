export function SunArc() {
  return (
    <div className="sw-arc" aria-hidden="true">
      <svg viewBox="0 0 520 260" className="absolute inset-0 h-full w-full">
        <path
          d="M 20 250 A 240 240 0 0 1 500 250"
          fill="none"
          stroke="color-mix(in oklab, var(--ember) 35%, transparent)"
          strokeWidth="1"
          strokeDasharray="3 6"
        />
        <line x1="0" y1="250" x2="520" y2="250" stroke="color-mix(in oklab, var(--fog) 40%, transparent)" strokeWidth="1" />
      </svg>
      <div className="sw-orbit">
        <span className="sw-sun" />
      </div>
    </div>
  );
}
