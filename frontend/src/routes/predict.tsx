import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { NoiseOverlay } from "@/components/showcase/NoiseOverlay";
import { SunArc } from "@/components/showcase/SunArc";
import { SiteNav } from "@/components/showcase/SiteNav";
import { SiteFooter } from "@/components/showcase/SiteFooter";
import { useFadeUp } from "@/hooks/use-fade-up";
import {
  predict,
  scenarioLabel,
  ARCH_LABEL,
  type PredictInputs,
  type Arch,
} from "@/lib/predict-sim";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Live Testing Manual Demo — Live Clearness Index Kt Forecasting" },
      {
        name: "description",
        content:
          "Live testing manual demo: input atmospheric conditions and see how eight forecasting architectures predict the Clearness Index Kt over Ouarzazate in real time.",
      },
      { property: "og:title", content: "Live Testing Manual Demo — Live Kt Forecasting" },
      {
        property: "og:description",
        content:
          "Adjust hour, AOD, humidity and dust conditions and watch transformer, XGBoost, MLP, RF and baseline models forecast live.",
      },
    ],
  }),
  component: PredictPage,
});

const ARCH_BADGE_CLASS: Record<Arch, string> = {
  transformer: "sw-badge-transformer",
  xgboost: "sw-badge-xgboost",
  mlp: "sw-badge-mlp",
  rf: "sw-badge-rf",
  baseline: "sw-badge-baseline",
};

const DEFAULTS: PredictInputs = {
  hour: 12,
  doy: 180,
  temp: 32,
  humidity: 20,
  wind: 8,
  ktPrev1: 0.85,
  ktPrev2: 0.87,
  aod: 0.15,
  dust: false,
};

const PRESETS: { label: string; desc: string; values: Partial<PredictInputs> }[] = [
  {
    label: "Perfect clear day",
    desc: "DOY 180 · solar noon · AOD 0.05",
    values: { doy: 180, hour: 12, aod: 0.05, ktPrev1: 0.95, ktPrev2: 0.96, dust: false, humidity: 18 },
  },
  {
    label: "Typical hazy afternoon",
    desc: "DOY 200 · 15:00 · AOD 0.35",
    values: { doy: 200, hour: 15, aod: 0.35, humidity: 40, dust: false, ktPrev1: 0.7, ktPrev2: 0.72 },
  },
  {
    label: "Saharan dust event",
    desc: "AOD 1.40 · dust ON · prev 0.45/0.60",
    values: { aod: 1.4, dust: true, ktPrev1: 0.45, ktPrev2: 0.6, humidity: 35 },
  },
  {
    label: "Dawn transition",
    desc: "07:00 · DOY 90 · AOD 0.10",
    values: { hour: 7, doy: 90, aod: 0.1, ktPrev1: 0.3, ktPrev2: 0.1, dust: false },
  },
];

function PredictPage() {
  useFadeUp();
  const [inputs, setInputs] = useState<PredictInputs>(DEFAULTS);
  const [transitioning, setTransitioning] = useState(false);
  const prevPredictions = useRef<Record<string, number>>({});

  const results = useMemo(() => predict(inputs), [inputs]);
  const trueKt = results[0]?.trueKt ?? 0;
  const scenario = scenarioLabel(inputs.aod);

  // winning model = lowest MAE (excluding cases where all are 0/night)
  const winner = useMemo(
    () => [...results].sort((a, b) => a.mae - b.mae)[0],
    [results],
  );

  const set = <K extends keyof PredictInputs>(key: K, value: PredictInputs[K]) =>
    setInputs((p) => ({ ...p, [key]: value }));

  const applyValues = (values: Partial<PredictInputs>) => {
    // snapshot current predictions to compute deltas after transition
    const snap: Record<string, number> = {};
    results.forEach((r) => (snap[r.config.id] = r.predicted));
    prevPredictions.current = snap;
    setTransitioning(true);
    setInputs((p) => ({ ...p, ...values }));
    window.setTimeout(() => setTransitioning(false), 550);
  };

  const simulateDustStorm = () =>
    applyValues({ aod: 1.4, humidity: 35, ktPrev1: 0.45, ktPrev2: 0.6, dust: true });

  return (
    <div className="min-h-screen bg-night text-pale">
      <NoiseOverlay />
      <SiteNav active="predict" />

      {/* 1. HERO */}
      <header className="relative overflow-hidden border-b border-ember/30 px-6 pb-20 pt-16">
        <div className="mx-auto max-w-6xl">
          <p className="sw-label">Live Testing Manual Demo · Ouarzazate</p>
          <h1 className="mt-8 max-w-3xl font-display text-5xl font-black italic leading-[1.05] md:text-7xl">
            Live Testing Manual Demo
          </h1>
          <p className="mt-6 max-w-2xl font-fraunces text-lg italic text-dusk md:text-xl">
            Input atmospheric conditions and see how each architecture forecasts the
            Clearness Index Kt in real time.
          </p>
          <div className="mt-12">
            <SunArc />
          </div>
        </div>
      </header>

      {/* 2 + 3 INPUT + OUTPUT */}
      <section className="bg-pale px-6 py-20 text-ink">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* INPUT PANEL */}
          <div className="sw-fade">
            <p className="sw-label">Atmospheric Inputs</p>
            <div
              className={`mt-6 border border-ember/40 bg-ink p-6 text-pale ${
                transitioning ? "sw-transition" : ""
              }`}
              style={{ borderRadius: 4 }}
            >
              <Slider label="Hour of day" unit="h" min={0} max={23} step={1} value={inputs.hour} onChange={(v) => set("hour", v)} />
              <Slider label="Day of year" unit="DOY" min={1} max={365} step={1} value={inputs.doy} onChange={(v) => set("doy", v)} />
              <Slider label="Temperature" unit="°C" min={5} max={50} step={1} value={inputs.temp} onChange={(v) => set("temp", v)} />
              <Slider label="Relative humidity" unit="%" min={0} max={100} step={1} value={inputs.humidity} onChange={(v) => set("humidity", v)} />
              <Slider label="Wind speed" unit="m/s" min={0} max={30} step={1} value={inputs.wind} onChange={(v) => set("wind", v)} />
              <Slider label="Previous Kt (t-1)" unit="Kt" min={0} max={1} step={0.01} value={inputs.ktPrev1} onChange={(v) => set("ktPrev1", v)} />
              <Slider label="Previous Kt (t-2)" unit="Kt" min={0} max={1} step={0.01} value={inputs.ktPrev2} onChange={(v) => set("ktPrev2", v)} />
              <Slider
                label="AOD 550nm"
                unit="—"
                min={0}
                max={2}
                step={0.01}
                value={inputs.aod}
                onChange={(v) => set("aod", v)}
                glow={inputs.dust}
              />

              {/* Dust toggle */}
              <div className="mt-6 flex items-center justify-between border-t border-ember/20 pt-5">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-fog">
                  Dust event
                </span>
                <button
                  onClick={() => set("dust", !inputs.dust)}
                  className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em]"
                  style={{ color: inputs.dust ? "var(--ember)" : "var(--fog)" }}
                >
                  <span
                    className="inline-block h-3 w-6 border"
                    style={{
                      borderRadius: 2,
                      borderColor: inputs.dust ? "var(--ember)" : "var(--fog)",
                      background: inputs.dust ? "var(--ember)" : "transparent",
                    }}
                  />
                  {inputs.dust ? "On" : "Off"}
                </button>
              </div>

              <button
                onClick={simulateDustStorm}
                className="mt-6 w-full border border-ember bg-ember/10 py-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-ember transition-colors hover:bg-ember hover:text-night"
                style={{ borderRadius: 2 }}
              >
                Simulate Dust Storm
              </button>
            </div>
          </div>

          {/* OUTPUT PANEL */}
          <div className="sw-fade">
            <div className="flex items-center justify-between">
              <p className="sw-label">Live Forecast · Ranked</p>
              <span className="font-mono text-[0.7rem] text-fog">
                true Kt {trueKt.toFixed(3)}
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {results.map((r) => {
                const prev = prevPredictions.current[r.config.id];
                const delta = prev === undefined ? 0 : r.predicted - prev;
                return (
                  <div
                    key={r.config.id}
                    className={`border border-ember/30 bg-ink/95 p-4 text-pale ${
                      transitioning ? "sw-transition" : ""
                    }`}
                    style={{ borderRadius: 4 }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className={`sw-badge ${ARCH_BADGE_CLASS[r.config.arch]}`}>
                          {ARCH_LABEL[r.config.arch]}
                        </span>
                        <span className="font-mono text-[0.8rem]">{r.config.name}</span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        {delta !== 0 && (
                          <span
                            className="font-mono text-[0.7rem]"
                            style={{ color: delta > 0 ? "var(--sky)" : "var(--ember)" }}
                          >
                            {delta > 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(3)}
                          </span>
                        )}
                        <span className="font-display text-3xl italic leading-none">
                          {r.predicted.toFixed(3)}
                        </span>
                      </div>
                    </div>
                    {/* bar */}
                    <div className="mt-3 h-2 w-full bg-fog/20" style={{ borderRadius: 2 }}>
                      <div className="relative h-full" style={{ width: `${r.predicted * 100}%` }}>
                        <div
                          className="h-full"
                          style={{ background: "var(--ember)", borderRadius: 2 }}
                        />
                        {/* confidence band extension */}
                        <div
                          className="absolute top-0 h-full"
                          style={{
                            left: "100%",
                            width: `${r.confidence * 100}%`,
                            background: "color-mix(in oklab, var(--ember) 35%, transparent)",
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. METRICS STRIP */}
      <section className="border-y border-ember/30 bg-ink px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="sw-label">Live Metrics · Current Scenario</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Metric label="Scenario" value={scenario} accent />
            <Metric
              label="Currently winning"
              value={trueKt === 0 ? "—" : winner.config.name}
            />
            <Metric
              label="Best MAE vs true Kt"
              value={trueKt === 0 ? "—" : winner.mae.toFixed(4)}
            />
          </div>
          <table className="sw-table mt-8">
            <thead>
              <tr>
                <th className="text-left">Model</th>
                <th className="text-left">Arch</th>
                <th className="num">Predicted</th>
                <th className="num">MAE</th>
              </tr>
            </thead>
            <tbody>
              {[...results]
                .sort((a, b) => a.mae - b.mae)
                .map((r) => (
                  <tr key={r.config.id}>
                    <td>{r.config.name}</td>
                    <td>
                      <span className={`sw-badge ${ARCH_BADGE_CLASS[r.config.arch]}`}>
                        {ARCH_LABEL[r.config.arch]}
                      </span>
                    </td>
                    <td className="num">{r.predicted.toFixed(3)}</td>
                    <td className="num">{r.mae.toFixed(4)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. PRESETS */}
      <section className="bg-pale px-6 py-20 text-ink">
        <div className="mx-auto max-w-6xl">
          <p className="sw-label">Scenario Presets</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyValues(p.values)}
                className="sw-fade group border border-ink/15 bg-pale p-6 text-left transition-colors hover:border-ember"
                style={{ borderRadius: 4 }}
              >
                <p className="font-display text-2xl italic">{p.label}</p>
                <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fog group-hover:text-ember">
                  {p.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Slider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  glow,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  glow?: boolean;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-fog">
          {label}
        </span>
        <span className="font-mono text-[0.8rem] text-ember">
          {step < 1 ? value.toFixed(2) : value}
          <span className="ml-1 text-fog">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        className={`sw-range ${glow ? "sw-range-glow" : ""}`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-ember/25 p-5" style={{ borderRadius: 4 }}>
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-fog">{label}</p>
      <p
        className="mt-2 font-display text-2xl italic"
        style={{ color: accent ? "var(--ember)" : "var(--pale)" }}
      >
        {value}
      </p>
    </div>
  );
}
