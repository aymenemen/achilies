export type Arch = "transformer" | "xgboost" | "mlp" | "rf" | "baseline";

export interface ModelConfig {
  id: string;
  name: string;
  arch: Arch;
  variance: number; // base noise magnitude
}

export interface PredictInputs {
  hour: number;
  doy: number;
  temp: number;
  humidity: number;
  wind: number;
  ktPrev1: number;
  ktPrev2: number;
  aod: number;
  dust: boolean;
}

export interface ModelResult {
  config: ModelConfig;
  predicted: number;
  trueKt: number;
  confidence: number; // band half-width
  mae: number;
}

export const MODELS: ModelConfig[] = [
  { id: "transformer-l", name: "Temporal Transformer (Large)", arch: "transformer", variance: 0.008 },
  { id: "transformer-b", name: "Temporal Transformer (Base)", arch: "transformer", variance: 0.008 },
  { id: "xgboost", name: "XGBoost", arch: "xgboost", variance: 0.015 },
  { id: "xgboost-fe", name: "XGBoost + Feature Eng.", arch: "xgboost", variance: 0.015 },
  { id: "mlp", name: "Multilayer Perceptron", arch: "mlp", variance: 0.025 },
  { id: "rf", name: "Random Forest", arch: "rf", variance: 0.035 },
  { id: "smart-persistence", name: "Smart Persistence", arch: "baseline", variance: 0 },
  { id: "climatology", name: "Climatology Baseline", arch: "baseline", variance: 0 },
];

export const ARCH_LABEL: Record<Arch, string> = {
  transformer: "transformer",
  xgboost: "xgboost",
  mlp: "mlp",
  rf: "rf",
  baseline: "baseline",
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Deterministic pseudo-noise in [-1, 1] from a string seed.
function hashNoise(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // map to [-1, 1]
  const x = (h >>> 0) / 4294967295;
  return x * 2 - 1;
}

/** Clean physics clearness index (before model noise). */
export function computeTrueKt(inp: PredictInputs): number {
  const daylight = clamp(Math.sin((Math.PI * (inp.hour - 6)) / 12), 0, 1);
  if (daylight <= 0) return 0;
  // seasonal factor: peaks near summer solstice (~DOY 172)
  const seasonal = 0.95 + 0.1 * Math.cos((2 * Math.PI * (inp.doy - 172)) / 365);
  let kt = (0.6 + 0.18 * daylight) * seasonal;
  // humidity slightly suppresses
  kt *= 1 - (inp.humidity / 100) * 0.1;
  // dust attenuation
  kt *= inp.dust ? 1 - inp.aod * 0.4 : 1 - inp.aod * 0.15;
  return clamp(kt, 0, 0.85);
}

export function scenarioLabel(aod: number): string {
  if (aod < 0.1) return "Clear sky";
  if (aod < 0.3) return "Light haze";
  if (aod < 0.8) return "Moderate dust";
  return "Heavy dust storm";
}

export function predict(inp: PredictInputs): ModelResult[] {
  const trueKt = computeTrueKt(inp);
  const seedBase = `${inp.hour}|${inp.doy}|${inp.temp}|${inp.humidity}|${inp.wind}|${inp.aod}|${inp.dust}`;

  return MODELS.map((config) => {
    let predicted: number;
    let confidence: number;

    if (config.id === "smart-persistence") {
      predicted = (inp.ktPrev1 + inp.ktPrev2) / 2;
      confidence = 0.04;
    } else if (config.id === "climatology") {
      // long-run clear-sky expectation, ignores live transients
      const daylight = clamp(Math.sin((Math.PI * (inp.hour - 6)) / 12), 0, 1);
      predicted = daylight <= 0 ? 0 : clamp(0.62 * daylight + 0.05, 0, 0.85);
      confidence = 0.06;
    } else {
      const n = hashNoise(seedBase + "|" + config.id);
      let error = n * config.variance;
      if (inp.dust) {
        if (config.arch === "transformer") error *= 1.8; // overshoots more
        if (config.arch === "rf") error *= 0.9; // undershoots less
      }
      predicted = clamp(trueKt + error, 0, 1);
      confidence = config.variance * 1.5 + (inp.dust ? 0.01 : 0);
    }

    return {
      config,
      predicted,
      trueKt,
      confidence,
      mae: Math.abs(predicted - trueKt),
    };
  }).sort((a, b) => b.predicted - a.predicted);
}
