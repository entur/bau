import { useMemo } from "react";
import { useGeocoderFetch } from "./useGeocoderFetch";
import { Env, getBaseUrl, buildQueryParams } from "./api";

export interface ReverseOptions {
  lat: string;
  lon: string;
  env: Env;
  size?: number;
  layers?: string;
  sources?: string;
  multiModal?: string;
  boundaryCircleRadius?: string;
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

export const useReverse = (options: ReverseOptions) => {
  const { env, size = 30, ...rest } = options;

  const url = useMemo(() => {
    const baseUrl = getBaseUrl(env);
    return buildReverseUrl(baseUrl, { ...rest, size });
  }, [env, size, rest.lat, rest.lon, rest.layers, rest.sources, rest.multiModal, rest.boundaryCircleRadius]);

  return useGeocoderFetch({ url });
};
