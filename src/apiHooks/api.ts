import { Properties, Result } from "./response.types";

export enum Env {
  OFF = "off",
  LOCAL = "local",
  DEV = "dev",
  DEV_SE = "dev-se",
  STAGING = "staging",
  PROD = "prod",
  V3_DEV = "v3-dev",
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
  [Env.V3_LOCAL]: "v3-local",
};

export const getBaseUrl = (env: Env): string | null => {
  return {
    [Env.OFF]: null,
    [Env.LOCAL]: "http://localhost:8080/v2",
    [Env.DEV]: "https://api.dev.entur.io/geocoder/v2",
    [Env.DEV_SE]: "https://geocoder-proxy-se.dev.entur.io/v2",
    [Env.STAGING]: "https://api.staging.entur.io/geocoder/v2",
    [Env.PROD]: "https://api.entur.io/geocoder/v2",
    [Env.V3_DEV]: "https://api.dev.entur.io/geocoder/v3",
    [Env.V3_LOCAL]: "http://localhost:8080/v3",
  }[env];
};

export type ApiVersion = "v2" | "v3";

export const getApiVersion = (env: Env): ApiVersion =>
  env === Env.V3_DEV || env === Env.V3_LOCAL ? "v3" : "v2";

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
    name: { default: string; display: string; label?: string };
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

// v3 returns a GeoJSON FeatureCollection with structured properties (name.default /
// name.display, layer split out, stopPlaceTypes + categories). Flatten it onto the same
// Result shape the UI already consumes; the raw v3 properties are kept for the JSON dump.
export const parseV3Response = (data: { features?: V3Feature[] }, useLabel = false): Result[] => {
  return (data.features ?? []).map((feature) => {
    const p = feature.properties;
    // Coerce at the leaves: a payload missing name.default/display must not flow `undefined`
    // into the string-typed Result.name / Properties.label fields.
    const defaultName = p.name?.default ?? "";
    const displayName = p.name?.display ?? defaultName;
    const categories = [...(p.stopPlaceTypes ?? []), ...(p.categories ?? [])];
    return {
      name: useLabel ? displayName : defaultName,
      layer: p.layer,
      categories,
      properties: {
        ...p,
        id: p.id,
        layer: p.layer,
        source: p.source,
        name: defaultName,
        label: displayName,
        category: categories,
      },
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
