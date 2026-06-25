export function SiteFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-[var(--dust-line)] bg-night px-12 py-12 max-md:flex-col max-md:gap-4 max-md:px-6 max-md:text-center">
      <div className="font-display text-[1.2rem] italic text-dusk">
        Kt Forecasting Research
      </div>
      <div className="text-right text-[0.65rem] tracking-[0.1em] text-fog max-md:text-center">
        Ouarzazate Solar Complex · Drâa-Tafilalet Region
        <br />
        Short-term solar irradiance forecasting under Saharan dust conditions
      </div>
    </footer>
  );
}
