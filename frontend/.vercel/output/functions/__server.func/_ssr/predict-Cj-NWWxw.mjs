import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useFadeUp, N as NoiseOverlay, S as SiteNav, a as SunArc, b as SiteFooter } from "./use-fade-up-CflI064G.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const MODELS = [
  { id: "transformer-l", name: "Temporal Transformer (Large)", arch: "transformer", variance: 8e-3 },
  { id: "transformer-b", name: "Temporal Transformer (Base)", arch: "transformer", variance: 8e-3 },
  { id: "xgboost", name: "XGBoost", arch: "xgboost", variance: 0.015 },
  { id: "xgboost-fe", name: "XGBoost + Feature Eng.", arch: "xgboost", variance: 0.015 },
  { id: "mlp", name: "Multilayer Perceptron", arch: "mlp", variance: 0.025 },
  { id: "rf", name: "Random Forest", arch: "rf", variance: 0.035 },
  { id: "smart-persistence", name: "Smart Persistence", arch: "baseline", variance: 0 },
  { id: "climatology", name: "Climatology Baseline", arch: "baseline", variance: 0 }
];
const ARCH_LABEL = {
  transformer: "transformer",
  xgboost: "xgboost",
  mlp: "mlp",
  rf: "rf",
  baseline: "baseline"
};
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function hashNoise(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const x = (h >>> 0) / 4294967295;
  return x * 2 - 1;
}
function computeTrueKt(inp) {
  const daylight = clamp(Math.sin(Math.PI * (inp.hour - 6) / 12), 0, 1);
  if (daylight <= 0) return 0;
  const seasonal = 0.95 + 0.1 * Math.cos(2 * Math.PI * (inp.doy - 172) / 365);
  let kt = (0.6 + 0.18 * daylight) * seasonal;
  kt *= 1 - inp.humidity / 100 * 0.1;
  kt *= inp.dust ? 1 - inp.aod * 0.4 : 1 - inp.aod * 0.15;
  return clamp(kt, 0, 0.85);
}
function scenarioLabel(aod) {
  if (aod < 0.1) return "Clear sky";
  if (aod < 0.3) return "Light haze";
  if (aod < 0.8) return "Moderate dust";
  return "Heavy dust storm";
}
function predict(inp) {
  const trueKt = computeTrueKt(inp);
  const seedBase = `${inp.hour}|${inp.doy}|${inp.temp}|${inp.humidity}|${inp.wind}|${inp.aod}|${inp.dust}`;
  return MODELS.map((config) => {
    let predicted;
    let confidence;
    if (config.id === "smart-persistence") {
      predicted = (inp.ktPrev1 + inp.ktPrev2) / 2;
      confidence = 0.04;
    } else if (config.id === "climatology") {
      const daylight = clamp(Math.sin(Math.PI * (inp.hour - 6) / 12), 0, 1);
      predicted = daylight <= 0 ? 0 : clamp(0.62 * daylight + 0.05, 0, 0.85);
      confidence = 0.06;
    } else {
      const n = hashNoise(seedBase + "|" + config.id);
      let error = n * config.variance;
      if (inp.dust) {
        if (config.arch === "transformer") error *= 1.8;
        if (config.arch === "rf") error *= 0.9;
      }
      predicted = clamp(trueKt + error, 0, 1);
      confidence = config.variance * 1.5 + (inp.dust ? 0.01 : 0);
    }
    return {
      config,
      predicted,
      trueKt,
      confidence,
      mae: Math.abs(predicted - trueKt)
    };
  }).sort((a, b) => b.predicted - a.predicted);
}
const ARCH_BADGE_CLASS = {
  transformer: "sw-badge-transformer",
  xgboost: "sw-badge-xgboost",
  mlp: "sw-badge-mlp",
  rf: "sw-badge-rf",
  baseline: "sw-badge-baseline"
};
const DEFAULTS = {
  hour: 12,
  doy: 180,
  temp: 32,
  humidity: 20,
  wind: 8,
  ktPrev1: 0.85,
  ktPrev2: 0.87,
  aod: 0.15,
  dust: false
};
const PRESETS = [{
  label: "Perfect clear day",
  desc: "DOY 180 · solar noon · AOD 0.05",
  values: {
    doy: 180,
    hour: 12,
    aod: 0.05,
    ktPrev1: 0.95,
    ktPrev2: 0.96,
    dust: false,
    humidity: 18
  }
}, {
  label: "Typical hazy afternoon",
  desc: "DOY 200 · 15:00 · AOD 0.35",
  values: {
    doy: 200,
    hour: 15,
    aod: 0.35,
    humidity: 40,
    dust: false,
    ktPrev1: 0.7,
    ktPrev2: 0.72
  }
}, {
  label: "Saharan dust event",
  desc: "AOD 1.40 · dust ON · prev 0.45/0.60",
  values: {
    aod: 1.4,
    dust: true,
    ktPrev1: 0.45,
    ktPrev2: 0.6,
    humidity: 35
  }
}, {
  label: "Dawn transition",
  desc: "07:00 · DOY 90 · AOD 0.10",
  values: {
    hour: 7,
    doy: 90,
    aod: 0.1,
    ktPrev1: 0.3,
    ktPrev2: 0.1,
    dust: false
  }
}];
function PredictPage() {
  useFadeUp();
  const [inputs, setInputs] = reactExports.useState(DEFAULTS);
  const [transitioning, setTransitioning] = reactExports.useState(false);
  const prevPredictions = reactExports.useRef({});
  const results = reactExports.useMemo(() => predict(inputs), [inputs]);
  const trueKt = results[0]?.trueKt ?? 0;
  const scenario = scenarioLabel(inputs.aod);
  const winner = reactExports.useMemo(() => [...results].sort((a, b) => a.mae - b.mae)[0], [results]);
  const set = (key, value) => setInputs((p) => ({
    ...p,
    [key]: value
  }));
  const applyValues = (values) => {
    const snap = {};
    results.forEach((r) => snap[r.config.id] = r.predicted);
    prevPredictions.current = snap;
    setTransitioning(true);
    setInputs((p) => ({
      ...p,
      ...values
    }));
    window.setTimeout(() => setTransitioning(false), 550);
  };
  const simulateDustStorm = () => applyValues({
    aod: 1.4,
    humidity: 35,
    ktPrev1: 0.45,
    ktPrev2: 0.6,
    dust: true
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-night text-pale", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(NoiseOverlay, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteNav, { active: "predict" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "relative overflow-hidden border-b border-ember/30 px-6 pb-20 pt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "sw-label", children: "Live Testing Manual Demo · Ouarzazate" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-8 max-w-3xl font-display text-5xl font-black italic leading-[1.05] md:text-7xl", children: "Live Testing Manual Demo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-2xl font-fraunces text-lg italic text-dusk md:text-xl", children: "Input atmospheric conditions and see how each architecture forecasts the Clearness Index Kt in real time." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SunArc, {}) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-pale px-6 py-20 text-ink", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,360px)_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sw-fade", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "sw-label", children: "Atmospheric Inputs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-6 border border-ember/40 bg-ink p-6 text-pale ${transitioning ? "sw-transition" : ""}`, style: {
          borderRadius: 4
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "Hour of day", unit: "h", min: 0, max: 23, step: 1, value: inputs.hour, onChange: (v) => set("hour", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "Day of year", unit: "DOY", min: 1, max: 365, step: 1, value: inputs.doy, onChange: (v) => set("doy", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "Temperature", unit: "°C", min: 5, max: 50, step: 1, value: inputs.temp, onChange: (v) => set("temp", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "Relative humidity", unit: "%", min: 0, max: 100, step: 1, value: inputs.humidity, onChange: (v) => set("humidity", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "Wind speed", unit: "m/s", min: 0, max: 30, step: 1, value: inputs.wind, onChange: (v) => set("wind", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "Previous Kt (t-1)", unit: "Kt", min: 0, max: 1, step: 0.01, value: inputs.ktPrev1, onChange: (v) => set("ktPrev1", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "Previous Kt (t-2)", unit: "Kt", min: 0, max: 1, step: 0.01, value: inputs.ktPrev2, onChange: (v) => set("ktPrev2", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { label: "AOD 550nm", unit: "—", min: 0, max: 2, step: 0.01, value: inputs.aod, onChange: (v) => set("aod", v), glow: inputs.dust }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-between border-t border-ember/20 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[0.7rem] uppercase tracking-[0.18em] text-fog", children: "Dust event" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => set("dust", !inputs.dust), className: "flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em]", style: {
              color: inputs.dust ? "var(--ember)" : "var(--fog)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-3 w-6 border", style: {
                borderRadius: 2,
                borderColor: inputs.dust ? "var(--ember)" : "var(--fog)",
                background: inputs.dust ? "var(--ember)" : "transparent"
              } }),
              inputs.dust ? "On" : "Off"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: simulateDustStorm, className: "mt-6 w-full border border-ember bg-ember/10 py-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-ember transition-colors hover:bg-ember hover:text-night", style: {
            borderRadius: 2
          }, children: "Simulate Dust Storm" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sw-fade", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "sw-label", children: "Live Forecast · Ranked" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[0.7rem] text-fog", children: [
            "true Kt ",
            trueKt.toFixed(3)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-3", children: results.map((r) => {
          const prev = prevPredictions.current[r.config.id];
          const delta = prev === void 0 ? 0 : r.predicted - prev;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border border-ember/30 bg-ink/95 p-4 text-pale ${transitioning ? "sw-transition" : ""}`, style: {
            borderRadius: 4
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `sw-badge ${ARCH_BADGE_CLASS[r.config.arch]}`, children: ARCH_LABEL[r.config.arch] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[0.8rem]", children: r.config.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-3", children: [
                delta !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[0.7rem]", style: {
                  color: delta > 0 ? "var(--sky)" : "var(--ember)"
                }, children: [
                  delta > 0 ? "↑" : "↓",
                  " ",
                  Math.abs(delta).toFixed(3)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-3xl italic leading-none", children: r.predicted.toFixed(3) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-2 w-full bg-fog/20", style: {
              borderRadius: 2
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-full", style: {
              width: `${r.predicted * 100}%`
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full", style: {
                background: "var(--ember)",
                borderRadius: 2
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 h-full", style: {
                left: "100%",
                width: `${r.confidence * 100}%`,
                background: "color-mix(in oklab, var(--ember) 35%, transparent)",
                borderRadius: 2
              } })
            ] }) })
          ] }, r.config.id);
        }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-y border-ember/30 bg-ink px-6 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "sw-label", children: "Live Metrics · Current Scenario" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-6 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Scenario", value: scenario, accent: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Currently winning", value: trueKt === 0 ? "—" : winner.config.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Best MAE vs true Kt", value: trueKt === 0 ? "—" : winner.mae.toFixed(4) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "sw-table mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left", children: "Model" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left", children: "Arch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "num", children: "Predicted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "num", children: "MAE" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [...results].sort((a, b) => a.mae - b.mae).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.config.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `sw-badge ${ARCH_BADGE_CLASS[r.config.arch]}`, children: ARCH_LABEL[r.config.arch] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "num", children: r.predicted.toFixed(3) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "num", children: r.mae.toFixed(4) })
        ] }, r.config.id)) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-pale px-6 py-20 text-ink", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "sw-label", children: "Scenario Presets" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid gap-5 sm:grid-cols-2", children: PRESETS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => applyValues(p.values), className: "sw-fade group border border-ink/15 bg-pale p-6 text-left transition-colors hover:border-ember", style: {
        borderRadius: 4
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl italic", children: p.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fog group-hover:text-ember", children: p.desc })
      ] }, p.label)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
  ] });
}
function Slider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  glow
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 first:mt-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[0.7rem] uppercase tracking-[0.14em] text-fog", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[0.8rem] text-ember", children: [
        step < 1 ? value.toFixed(2) : value,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-fog", children: unit })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", className: `sw-range ${glow ? "sw-range-glow" : ""}`, min, max, step, value, onChange: (e) => onChange(Number(e.target.value)) })
  ] });
}
function Metric({
  label,
  value,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-ember/25 p-5", style: {
    borderRadius: 4
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[0.6rem] uppercase tracking-[0.22em] text-fog", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-display text-2xl italic", style: {
      color: accent ? "var(--ember)" : "var(--pale)"
    }, children: value })
  ] });
}
export {
  PredictPage as component
};
