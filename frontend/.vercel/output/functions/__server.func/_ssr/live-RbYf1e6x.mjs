import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useFadeUp, N as NoiseOverlay, S as SiteNav, a as SunArc, b as SiteFooter } from "./use-fade-up-CflI064G.mjs";
import { D as Download } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
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
const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = DEFAULT_API_BASE_URL.replace(/\/$/, "");
function apiUrl(path) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 break-words font-display text-2xl italic", style: {
      color: accent ? "var(--ember)" : "var(--ink)"
    }, children: value })
  ] });
}
function LivePage() {
  useFadeUp();
  const {
    data: predictData,
    isLoading: predictLoading,
    error: predictError
  } = useQuery({
    queryKey: ["predict"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/predict"));
      if (!res.ok) throw new Error("Failed to fetch current prediction");
      return res.json();
    },
    refetchInterval: 6e4
    // refresh every minute
  });
  const {
    data: forecastData,
    isLoading: forecastLoading
  } = useQuery({
    queryKey: ["forecast"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/forecast"));
      if (!res.ok) throw new Error("Failed to fetch forecast");
      return res.json();
    },
    refetchInterval: 3e5
    // refresh every 5 mins
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-night text-pale", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(NoiseOverlay, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteNav, { active: "live" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "relative overflow-hidden border-b border-ember/30 px-6 pb-20 pt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "sw-label", children: "Live API Feed · Ouarzazate" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-8 max-w-3xl font-display text-5xl font-black italic leading-[1.05] md:text-7xl", children: "Live Results" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-2xl font-fraunces text-lg italic text-dusk md:text-xl", children: "Real-time data ingested from the backend prediction API utilizing live meteorological conditions." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SunArc, {}) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-pale px-6 py-20 text-ink", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl sw-fade", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "sw-label", children: "Current Hour Prediction" }),
      predictLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 p-6 text-fog font-mono text-sm", children: "Loading current prediction..." }) : predictError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 p-6 text-ember font-mono text-sm", children: "Error connecting to API. Is backend running?" }) : predictData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-6 md:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Timestamp", value: new Date(predictData.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Predicted DNI", value: `${predictData.DNI_pred} W/m2`, accent: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Clearsky DNI", value: `${predictData.DNI_clearsky} W/m2` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Clearness Kt", value: predictData.Kt_pred, accent: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "GHI", value: `${predictData.GHI} W/m2` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Temperature", value: `${predictData.temp} C` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Wind Speed", value: `${predictData.wind} m/s` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Model Used", value: predictData.model_used })
      ] }) : null
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-y border-ember/30 bg-ink px-6 py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl sw-fade", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "sw-label", children: "24-Hour Forecast" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: apiUrl("/forecast.csv"), className: "inline-flex items-center gap-2 border border-ember px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ember transition-colors hover:bg-ember hover:text-night", style: {
          borderRadius: 2
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4", "aria-hidden": "true" }),
          "Extract CSV"
        ] })
      ] }),
      forecastLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 p-6 text-fog font-mono text-sm", children: "Loading forecast data..." }) : forecastData ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "sw-table w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left", children: "Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "num", children: "Predicted DNI" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "num", children: "Clearsky DNI" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "num", children: "Kt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "num", children: "Temp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "num", children: "Wind" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: forecastData.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: new Date(row.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "num text-ember", children: row.DNI_pred }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "num", children: row.DNI_clearsky }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "num text-sky", children: row.Kt_pred }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "num", children: [
            row.temp,
            " C"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "num", children: [
            row.wind,
            " m/s"
          ] })
        ] }, i)) })
      ] }) }) : null
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
  ] });
}
export {
  LivePage as component
};
