import { useMemo } from "react";
import { useGeocoderFetch } from "./useGeocoderFetch";
import { V1Env, V2Env, getV1BaseUrl, getV2BaseUrl, buildQueryParams } from "./api";

export interface ReverseV1Options {
  lat: string;
  lon: string;
  env: V1Env;
  size?: number;
  layers?: string;
  sources?: string;
  multiModal?: string;
  boundaryCircleRadius?: string;
}

export interface ReverseV2Options {
  lat: string;
  lon: string;
  env: V2Env;
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

export const useReverseV1 = (options: ReverseV1Options) => {
  const { env, size = 30, ...rest } = options;

  const url = useMemo(() => {
    const baseUrl = getV1BaseUrl(env);
    return buildReverseUrl(baseUrl, { ...rest, size });
  }, [env, size, rest.lat, rest.lon, rest.layers, rest.sources, rest.multiModal, rest.boundaryCircleRadius]);

  return useGeocoderFetch({ url });
};

export const useReverseV2 = (options: ReverseV2Options) => {
  const { env, size = 30, ...rest } = options;

  const url = useMemo(() => {
    const baseUrl = getV2BaseUrl(env);
    return buildReverseUrl(baseUrl, { ...rest, size });
  }, [env, size, rest.lat, rest.lon, rest.layers, rest.sources, rest.multiModal, rest.boundaryCircleRadius]);

  return useGeocoderFetch({ url });
};
