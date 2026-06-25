import { Link } from "@tanstack/react-router";

export function SiteNav({ active }: { active: "home" | "predict" | "live" }) {
  const linkBase =
    "text-[0.7rem] uppercase tracking-[0.15em] transition-colors hover:text-sand";
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--dust-line)] bg-night/90 px-12 py-6 backdrop-blur max-md:px-6">
      <Link
        to="/"
        className="font-display text-[0.85rem] italic tracking-[0.08em] text-dusk"
      >
        Kt Forecasting Research
      </Link>
      <div className="flex items-center gap-8">
        <Link to="/" className={`${linkBase} ${active === "home" ? "text-sand" : "text-fog"}`}>
          Research
        </Link>
        <Link
          to="/predict"
          className={`${linkBase} ${active === "predict" ? "text-ember" : "text-fog"}`}
        >
          Live Testing Manual Demo
        </Link>
        <Link
          to="/live"
          className={`${linkBase} ${active === "live" ? "text-sky" : "text-fog"}`}
        >
          Live Results
        </Link>
      </div>
    </nav>
  );
}
