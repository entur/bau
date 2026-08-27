import { Properties, Result } from "./response.types";

export enum Env {
  OFF = "off",
  V2_LOCAL = "v2-local",
  V2_DEV = "v2-dev",
  V2_STAGING = "v2-staging",
  V2_PROD = "v2-prod",
  V3_LOCAL = "v3-local",
  V3_DEV = "v3-dev",
  V3_STAGING = "v3-staging",
  V3_PROD = "v3-prod",
  V3_DEV_SE = "v3-dev-se",
  V3_DEV_DK = "v3-dev-dk",
}

// Dropdown structure: "off" on its own, then one group per API version. The labels drop the
// version prefix since the group heading already carries it.
export const ENV_GROUPS: { label: string; options: Env[] }[] = [
  {
    label: "v2",
    options: [Env.V2_LOCAL, Env.V2_DEV, Env.V2_STAGING, Env.V2_PROD],
  },
  {
    label: "v3",
    options: [
      Env.V3_LOCAL,
      Env.V3_DEV,
      Env.V3_STAGING,
      Env.V3_PROD,
      Env.V3_DEV_SE,
      Env.V3_DEV_DK,
    ],
  },
];

export const ENV_LABELS: Record<Env, string> = {
  [Env.OFF]: "off",
  [Env.V2_LOCAL]: "local",
  [Env.V2_DEV]: "dev",
  [Env.V2_STAGING]: "staging",
  [Env.V2_PROD]: "prod",
  [Env.V3_LOCAL]: "local",
  [Env.V3_DEV]: "dev",
  [Env.V3_STAGING]: "staging",
  [Env.V3_PROD]: "prod",
  [Env.V3_DEV_SE]: "dev-se",
  [Env.V3_DEV_DK]: "dev-dk",
};

export const ENV_OPTIONS: Env[] = Object.values(Env);

/** Pre-rename env values, kept so older shared URLs still resolve. */
const ENV_ALIASES: Record<string, Env> = {
  local: Env.V2_LOCAL,
  dev: Env.V2_DEV,
  staging: Env.V2_STAGING,
  prod: Env.V2_PROD,
  "dev-se": Env.V3_DEV_SE,
  "dev-dk": Env.V3_DEV_DK,
  "v3-tst": Env.V3_STAGING,
  "v3-prd": Env.V3_PROD,
};

export const parseEnv = (value: string | null | undefined, fallback: Env): Env => {
  if (!value) return fallback;
  if (ENV_OPTIONS.includes(value as Env)) return value as Env;
  return ENV_ALIASES[value] ?? fallback;
};

export const getBaseUrl = (env: Env): string | null => {
  return {
    [Env.OFF]: null,
    [Env.V2_LOCAL]: "http://localhost:8080/v2",
    [Env.V2_DEV]: "https://api.dev.entur.io/geocoder/v2",
    [Env.V2_STAGING]: "https://api.staging.entur.io/geocoder/v2",
    [Env.V2_PROD]: "https://api.entur.io/geocoder/v2",
    [Env.V3_LOCAL]: "http://localhost:8080/v3",
    [Env.V3_DEV]: "https://api.dev.entur.io/geocoder/v3",
    [Env.V3_STAGING]: "https://api.staging.entur.io/geocoder/v3",
    [Env.V3_PROD]: "https://api.entur.io/geocoder/v3",
    [Env.V3_DEV_SE]: "https://geocoder-proxy-se.dev.entur.io/v3",
    [Env.V3_DEV_DK]: "https://geocoder-proxy-dk.dev.entur.io/v3",
  }[env];
};

export type ApiVersion = "v2" | "v3";

export const getApiVersion = (env: Env): ApiVersion =>
  env.startsWith("v3-") ? "v3" : "v2";

export const isV3Env = (env: Env): boolean => getApiVersion(env) === "v3";

interface GeoJSONFeature {
  properties: Properties;
  geometry?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export const parseGeocoderResponse = (data: { features: GeoJSONFeature[] }, useLabel = false): Result[] => {
  return data.features.map((feature) => ({
    name: (useLabel ? feature.properties.label ?? feature.properties.name : feature.properties.name) ?? "",
    layer: feature.properties.layer ?? "",
    categories: feature.properties.category ?? [],
    properties: feature.properties,
    geometry: feature.geometry,
    notExistsInOtherVersion: false,
  }));
};

interface V3Feature {
  properties: {
    id: string;
    // Optional because the parser must survive a payload without it. `label` is the
    // colloquial name (v2's popular_name) and is intentionally not used for display.
    names?: { default: string; display: string; label?: string };
    layer: string;
    source: string;
    address?: Record<string, unknown>;
    categories?: string[];
    stopPlaceTypes?: string[];
    transportModes?: { mode: string; subMode?: string }[];
    fareZones?: string[];
  };
  geometry?: {
    type: "Point";
    coordinates: [number, number];
  };
}

// v3 returns a GeoJSON FeatureCollection with structured properties (names.default /
// names.display, layer split out, stopPlaceTypes + categories). Flatten it onto the same
// Result shape the UI already consumes; the v3 properties are kept raw for the JSON dump.
export const parseV3Response = (data: { features?: V3Feature[] }, useLabel = false): Result[] => {
  return (data.features ?? []).map((feature) => {
    const p = feature.properties;
    // Coerce at the leaves: a payload missing names.default/display must not flow
    // `undefined` into the string-typed Result.name field.
    const defaultName = p.names?.default ?? "";
    const displayName = p.names?.display ?? defaultName;
    return {
      name: useLabel ? displayName : defaultName,
      layer: p.layer,
      categories: [...(p.stopPlaceTypes ?? []), ...(p.categories ?? [])],
      properties: p,
      geometry: feature.geometry,
      notExistsInOtherVersion: false,
    };
  });
};

/** The v3-specific search knobs (text, size, focus point and multimodal are shared with v2). */
export interface V3Params {
  radius: string;
  weight: string;
  layers: string;
  sources: string;
  countries: string;
  counties: string;
}

/** The filter params shared by v3 autocomplete and reverse requests. */
export const v3FilterParams = (options: {
  layers?: string;
  sources?: string;
  multimodal?: string;
  countries?: string;
  counties?: string;
}): Record<string, string | undefined> => ({
  layers: options.layers,
  sources: options.sources,
  multimodal: options.multimodal,
  countries: options.countries,
  counties: options.counties,
});

export const buildQueryParams = (params: Record<string, string | number | undefined>): string => {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");
};
