export function NoiseOverlay() {
  return (
    <svg className="sw-noise" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <filter id="sw-noise-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#sw-noise-filter)" />
    </svg>
  );
}
