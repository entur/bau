import { useMemo } from "react";
import { useGeocoderFetch } from "./useGeocoderFetch";
import { Env, V3Params, getApiVersion, getBaseUrl, buildQueryParams, v3FilterParams } from "./api";

export interface ReverseOptions {
  lat: string;
  lon: string;
  env: Env;
  size?: number;
  layers?: string;
  sources?: string;
  multiModal?: string;
  boundaryCircleRadius?: string;
  // v3-specific knobs (point and radius are shared with v2 above)
  v3?: V3Params;
}

const buildReverseUrl = (baseUrl: string | null, options: {
  lat: string;
  lon: string;
  size: number;
  layers?: string;
  sources?: string;
  multiModal?: string;
  boundaryCircleRadius?: string;
}): string | null => {
  if (!options.lat || !options.lon || !baseUrl) return null;

  const params = buildQueryParams({
    "point.lat": options.lat,
    "point.lon": options.lon,
    lang: "no",
    size: options.size,
    layers: options.layers,
    sources: options.sources,
    multiModal: options.multiModal,
    "boundary.circle.radius": options.boundaryCircleRadius,
  });

  return `${baseUrl}/reverse?${params}`;
};

const buildV3ReverseUrl = (baseUrl: string | null, options: {
  lat: string;
  lon: string;
  limit: number;
  radius?: string;
  layers?: string;
  sources?: string;
  multimodal?: string;
  countries?: string;
  counties?: string;
}): string | null => {
  if (!options.lat || !options.lon || !baseUrl) return null;

  // Reverse radius is in km in both v2 and v3, so it's shared (boundaryCircleRadius).
  const params = buildQueryParams({
    lat: options.lat,
    lon: options.lon,
    lang: "no",
    limit: options.limit,
    radius: options.radius,
    ...v3FilterParams(options),
  });

  return `${baseUrl}/reverse?${params}`;
};

export const useReverse = (options: ReverseOptions) => {
  const { env, size = 30, ...rest } = options;
  const version = getApiVersion(env);

  const url = useMemo(() => {
    const baseUrl = getBaseUrl(env);
    if (version === "v3") {
      return buildV3ReverseUrl(baseUrl, {
        lat: rest.lat,
        lon: rest.lon,
        limit: size,
        radius: rest.boundaryCircleRadius,
        layers: rest.v3?.layers,
        sources: rest.v3?.sources,
        multimodal: rest.multiModal,
        countries: rest.v3?.countries,
        counties: rest.v3?.counties,
      });
    }
    return buildReverseUrl(baseUrl, { ...rest, size });
  }, [env, version, size, rest.lat, rest.lon, rest.layers, rest.sources, rest.multiModal, rest.boundaryCircleRadius, rest.v3]);

  return useGeocoderFetch({ url, version });
};
