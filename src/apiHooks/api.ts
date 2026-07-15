import { Properties, Result } from "./response.types";

export enum Env {
  OFF = "off",
  LOCAL = "local",
  DEV = "dev",
  DEV_SE = "dev-se",
  STAGING = "staging",
  PROD = "prod",
  V3_DEV = "v3-dev",
  V3_TST = "v3-tst",
  V3_PRD = "v3-prd",
  V3_LOCAL = "v3-local",
}

export const ENV_LABELS: Record<Env, string> = {
  [Env.OFF]: "off",
  [Env.LOCAL]: "local",
  [Env.DEV]: "dev",
  [Env.DEV_SE]: "dev-se",
  [Env.STAGING]: "staging",
  [Env.PROD]: "prod",
  [Env.V3_DEV]: "v3-dev",
  [Env.V3_TST]: "v3-tst",
  [Env.V3_PRD]: "v3-prd",
  [Env.V3_LOCAL]: "v3-local",
};

// Every env, in enum declaration order (off, then v2 envs, then v3). Doubles as the
// dropdown ordering and the set of values accepted from the URL.
export const ENV_OPTIONS: Env[] = Object.values(Env);

export const getBaseUrl = (env: Env): string | null => {
  return {
    [Env.OFF]: null,
    [Env.LOCAL]: "http://localhost:8080/v2",
    [Env.DEV]: "https://api.dev.entur.io/geocoder/v2",
    [Env.DEV_SE]: "https://geocoder-proxy-se.dev.entur.io/v2",
    [Env.STAGING]: "https://api.staging.entur.io/geocoder/v2",
    [Env.PROD]: "https://api.entur.io/geocoder/v2",
    [Env.V3_DEV]: "https://api.dev.entur.io/geocoder/v3",
    [Env.V3_TST]: "https://api.staging.entur.io/geocoder/v3",
    [Env.V3_PRD]: "https://api.entur.io/geocoder/v3",
    [Env.V3_LOCAL]: "http://localhost:8080/v3",
  }[env];
};

export type ApiVersion = "v2" | "v3";

const V3_ENVS = [Env.V3_DEV, Env.V3_TST, Env.V3_PRD, Env.V3_LOCAL];

export const getApiVersion = (env: Env): ApiVersion =>
  V3_ENVS.includes(env) ? "v3" : "v2";

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
