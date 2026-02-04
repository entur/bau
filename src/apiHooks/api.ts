import { Properties, Result } from "./response.types";

export enum GeocoderVersion {
  V1 = "v1",
  V2 = "v2",
}

export enum ApiEnvironment {
  DEV = "dev",
  STAGING = "staging",
  PROD = "prod",
}

export const getApiUrl = (environment: ApiEnvironment): string => {
  switch (environment) {
    case ApiEnvironment.DEV:
      return "api.dev.entur.io";
    case ApiEnvironment.STAGING:
      return "api.staging.entur.io";
    case ApiEnvironment.PROD:
      return "api.entur.io";
  }
};

export const getBaseUrl = (
  version: GeocoderVersion,
  environment: ApiEnvironment,
  v2url?: string
): string => {
  const apiUrl = getApiUrl(environment);
  if (version === GeocoderVersion.V2 && (v2url || import.meta.env.VITE_GEOCODER_V2_URL)) {
    return v2url || import.meta.env.VITE_GEOCODER_V2_URL;
  }
  return `https://${apiUrl}/geocoder/${version}`;
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
