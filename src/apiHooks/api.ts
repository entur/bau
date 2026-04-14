import { Properties, Result } from "./response.types";

export enum Env {
  OFF = "off",
  LOCAL = "local",
  DEV = "dev",
  DEV_SE = "dev-se",
  STAGING = "staging",
  PROD = "prod",
}

export const ENV_LABELS: Record<Env, string> = {
  [Env.OFF]: "off",
  [Env.LOCAL]: "local",
  [Env.DEV]: "dev",
  [Env.DEV_SE]: "dev-se",
  [Env.STAGING]: "staging",
  [Env.PROD]: "prod",
};

export const getBaseUrl = (env: Env): string | null => {
  return {
    [Env.OFF]: null,
    [Env.LOCAL]: "http://localhost:8080/v2",
    [Env.DEV]: "https://api.dev.entur.io/geocoder/v2",
    [Env.DEV_SE]: "https://geocoder-proxy-se.dev.entur.io/v2",
    [Env.STAGING]: "https://api.staging.entur.io/geocoder/v2",
    [Env.PROD]: "https://api.entur.io/geocoder/v2",
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
