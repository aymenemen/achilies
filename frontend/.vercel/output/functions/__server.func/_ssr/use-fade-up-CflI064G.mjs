import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
function NoiseOverlay() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "sw-noise", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("filter", { id: "sw-noise-filter", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("feTurbulence", { type: "fractalNoise", baseFrequency: "0.8", numOctaves: "3", stitchTiles: "stitch" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("feColorMatrix", { type: "saturate", values: "0" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "100%", height: "100%", filter: "url(#sw-noise-filter)" })
  ] });
}
function SunArc() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sw-arc", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 520 260", className: "absolute inset-0 h-full w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          d: "M 20 250 A 240 240 0 0 1 500 250",
          fill: "none",
          stroke: "color-mix(in oklab, var(--ember) 35%, transparent)",
          strokeWidth: "1",
          strokeDasharray: "3 6"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "0", y1: "250", x2: "520", y2: "250", stroke: "color-mix(in oklab, var(--fog) 40%, transparent)", strokeWidth: "1" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sw-orbit", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sw-sun" }) })
  ] });
}
function SiteNav({ active }) {
  const linkBase = "text-[0.7rem] uppercase tracking-[0.15em] transition-colors hover:text-sand";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "sticky top-0 z-50 flex items-center justify-between border-b border-[var(--dust-line)] bg-night/90 px-12 py-6 backdrop-blur max-md:px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "font-display text-[0.85rem] italic tracking-[0.08em] text-dusk",
        children: "Kt Forecasting Research"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: `${linkBase} ${active === "home" ? "text-sand" : "text-fog"}`, children: "Research" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/predict",
          className: `${linkBase} ${active === "predict" ? "text-ember" : "text-fog"}`,
          children: "Live Testing Manual Demo"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/live",
          className: `${linkBase} ${active === "live" ? "text-sky" : "text-fog"}`,
          children: "Live Results"
        }
      )
    ] })
  ] });
}
function SiteFooter() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "flex items-center justify-between border-t border-[var(--dust-line)] bg-night px-12 py-12 max-md:flex-col max-md:gap-4 max-md:px-6 max-md:text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[1.2rem] italic text-dusk", children: "Kt Forecasting Research" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-[0.65rem] tracking-[0.1em] text-fog max-md:text-center", children: [
      "Ouarzazate Solar Complex · Drâa-Tafilalet Region",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      "Short-term solar irradiance forecasting under Saharan dust conditions"
    ] })
  ] });
}
function useFadeUp() {
  reactExports.useEffect(() => {
    const els = Array.from(document.querySelectorAll(".sw-fade"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
export {
  NoiseOverlay as N,
  SiteNav as S,
  SunArc as a,
  SiteFooter as b,
  useFadeUp as u
};
