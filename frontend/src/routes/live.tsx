import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { NoiseOverlay } from "@/components/showcase/NoiseOverlay";
import { SiteNav } from "@/components/showcase/SiteNav";
import { SiteFooter } from "@/components/showcase/SiteFooter";
import { useFadeUp } from "@/hooks/use-fade-up";
import { SunArc } from "@/components/showcase/SunArc";
import { Download } from "lucide-react";
import { apiUrl } from "@/lib/api";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Results — Ouarzazate Kt Forecast" },
      {
        name: "description",
        content: "Live Clearness Index Kt forecasting results from the FastAPI backend.",
      },
    ],
  }),
  component: LivePage,
});

function Metric({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="border border-ember/25 p-5" style={{ borderRadius: 4 }}>
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-fog">{label}</p>
      <p
        className="mt-2 break-words font-display text-2xl italic"
        style={{ color: accent ? "var(--ember)" : "var(--ink)" }}
      >
        {value}
      </p>
    </div>
  );
}

function LivePage() {
  useFadeUp();

  const { data: predictData, isLoading: predictLoading, error: predictError } = useQuery({
    queryKey: ["predict"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/predict"));
      if (!res.ok) throw new Error("Failed to fetch current prediction");
      return res.json();
    },
    refetchInterval: 60000, // refresh every minute
  });

  const { data: forecastData, isLoading: forecastLoading } = useQuery({
    queryKey: ["forecast"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/forecast"));
      if (!res.ok) throw new Error("Failed to fetch forecast");
      return res.json();
    },
    refetchInterval: 300000, // refresh every 5 mins
  });

  return (
    <div className="min-h-screen bg-night text-pale">
      <NoiseOverlay />
      <SiteNav active="live" />

      {/* 1. HERO */}
      <header className="relative overflow-hidden border-b border-ember/30 px-6 pb-20 pt-16">
        <div className="mx-auto max-w-6xl">
          <p className="sw-label">Live API Feed · Ouarzazate</p>
          <h1 className="mt-8 max-w-3xl font-display text-5xl font-black italic leading-[1.05] md:text-7xl">
            Live Results
          </h1>
          <p className="mt-6 max-w-2xl font-fraunces text-lg italic text-dusk md:text-xl">
            Real-time data ingested from the backend prediction API utilizing live meteorological conditions.
          </p>
          <div className="mt-12">
            <SunArc />
          </div>
        </div>
      </header>

      {/* 2. CURRENT PREDICTION */}
      <section className="bg-pale px-6 py-20 text-ink">
        <div className="mx-auto max-w-6xl sw-fade">
          <p className="sw-label">Current Hour Prediction</p>
          
          {predictLoading ? (
            <div className="mt-6 p-6 text-fog font-mono text-sm">Loading current prediction...</div>
          ) : predictError ? (
            <div className="mt-6 p-6 text-ember font-mono text-sm">Error connecting to API. Is backend running?</div>
          ) : predictData ? (
            <div className="mt-6 grid gap-6 md:grid-cols-4">
              <Metric label="Timestamp" value={new Date(predictData.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} />
              <Metric label="Predicted DNI" value={`${predictData.DNI_pred} W/m2`} accent />
              <Metric label="Clearsky DNI" value={`${predictData.DNI_clearsky} W/m2`} />
              <Metric label="Clearness Kt" value={predictData.Kt_pred} accent />
              <Metric label="GHI" value={`${predictData.GHI} W/m2`} />
              <Metric label="Temperature" value={`${predictData.temp} C`} />
              <Metric label="Wind Speed" value={`${predictData.wind} m/s`} />
              <Metric label="Model Used" value={predictData.model_used} />
            </div>
          ) : null}
        </div>
      </section>

      {/* 3. 24-HOUR FORECAST */}
      <section className="border-y border-ember/30 bg-ink px-6 py-20">
        <div className="mx-auto max-w-6xl sw-fade">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="sw-label">24-Hour Forecast</p>
            <a
              href={apiUrl("/forecast.csv")}
              className="inline-flex items-center gap-2 border border-ember px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ember transition-colors hover:bg-ember hover:text-night"
              style={{ borderRadius: 2 }}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Extract CSV
            </a>
          </div>
          
          {forecastLoading ? (
             <div className="mt-6 p-6 text-fog font-mono text-sm">Loading forecast data...</div>
          ) : forecastData ? (
            <div className="mt-8 overflow-x-auto">
              <table className="sw-table w-full">
                <thead>
                  <tr>
                    <th className="text-left">Time</th>
                    <th className="num">Predicted DNI</th>
                    <th className="num">Clearsky DNI</th>
                    <th className="num">Kt</th>
                    <th className="num">Temp</th>
                    <th className="num">Wind</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.map((row: any, i: number) => (
                    <tr key={i}>
                      <td>{new Date(row.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="num text-ember">{row.DNI_pred}</td>
                      <td className="num">{row.DNI_clearsky}</td>
                      <td className="num text-sky">{row.Kt_pred}</td>
                      <td className="num">{row.temp} C</td>
                      <td className="num">{row.wind} m/s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
