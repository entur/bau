import { Properties, Result } from "./response.types";

export enum GeocoderVersion {
  V1 = "v1",
  V2 = "v2",
}

// V1 environments
export enum V1Env {
  OFF = "off",
  DEV = "dev",
  STAGING = "staging",
  PROD = "prod",
}

// V2 environments
export enum V2Env {
  OFF = "off",
  LOCAL = "local",
  DEV = "dev",
  DEV_SE = "dev-se",
  STAGING = "staging",
  PROD = "prod",
}

export const V1_ENV_LABELS: Record<V1Env, string> = {
  [V1Env.OFF]: "off",
  [V1Env.DEV]: "dev",
  [V1Env.STAGING]: "staging",
  [V1Env.PROD]: "prod",
};

export const V2_ENV_LABELS: Record<V2Env, string> = {
  [V2Env.OFF]: "off",
  [V2Env.LOCAL]: "local",
  [V2Env.DEV]: "dev",
  [V2Env.DEV_SE]: "dev-se",
  [V2Env.STAGING]: "staging",
  [V2Env.PROD]: "prod",
};

export const getV1BaseUrl = (env: V1Env): string | null => {
  if (env === V1Env.OFF) return null;

  return {
    [V1Env.OFF]: null,
    [V1Env.DEV]: "https://api.dev.entur.io/geocoder/v1",
    [V1Env.STAGING]: "https://api.staging.entur.io/geocoder/v1",
    [V1Env.PROD]: "https://api.entur.io/geocoder/v1",
  }[env];
};

export const getV2BaseUrl = (env: V2Env): string | null => {
  return {
    [V2Env.OFF]: null,
    [V2Env.LOCAL]: "http://localhost:8080/v2",
    [V2Env.DEV]: "https://api.dev.entur.io/geocoder/v2",
    [V2Env.DEV_SE]: "https://geocoder-proxy-se.dev.entur.io/v2",
    [V2Env.STAGING]: "https://api.staging.entur.io/geocoder/v2",
    [V2Env.PROD]: "https://api.entur.io/geocoder/v2",
  }[env];
};

interface GeoJSONFeature {
  properties: Properties;
  geometry?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export const parseGeocoderResponse = (data: { features: GeoJSONFeature[] }, useLabel = false): Result[] => {
  return data.features.map((feature) => ({
    name: useLabel ? (feature.properties.label ?? feature.properties.name) : feature.properties.name,
    layer: feature.properties.layer,
    categories: feature.properties.category,
    properties: feature.properties,
    geometry: feature.geometry,
    notExistsInOtherVersion: false,
  }));
};

export const buildQueryParams = (params: Record<string, string | number | undefined>): string => {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");
};
