import { useMemo } from "react";
import { useGeocoderFetch } from "./useGeocoderFetch";
import { V1Env, V2Env, getV1BaseUrl, getV2BaseUrl, buildQueryParams } from "./api";

export { V1Env, V2Env } from "./api";

export interface AutoCompleteV1Options {
  searchTerm: string;
  env: V1Env;
  size?: number;
  focusLat?: string;
  focusLon?: string;
  focusScale?: string;
  focusWeight?: string;
  layers?: string;
  sources?: string;
  multiModal?: string;
  boundaryCountry?: string;
  boundaryCountyIds?: string;
}

export interface AutoCompleteV2Options {
  searchTerm: string;
  env: V2Env;
  size?: number;
  focusLat?: string;
  focusLon?: string;
  focusScale?: string;
  focusWeight?: string;
  layers?: string;
  sources?: string;
  multiModal?: string;
  boundaryCountry?: string;
  boundaryCountyIds?: string;
}

const buildAutoCompleteUrl = (baseUrl: string | null, options: {
  searchTerm: string;
  size: number;
  focusLat?: string;
  focusLon?: string;
  focusScale?: string;
  focusWeight?: string;
  layers?: string;
  sources?: string;
  multiModal?: string;
  boundaryCountry?: string;
  boundaryCountyIds?: string;
}): string | null => {
  if (!options.searchTerm || !baseUrl) return null;

  const params = buildQueryParams({
    lang: "no",
    size: options.size,
    text: options.searchTerm,
    "focus.point.lat": options.focusLat,
    "focus.point.lon": options.focusLon,
    "focus.scale": options.focusScale,
    "focus.weight": options.focusWeight,
    layers: options.layers,
    sources: options.sources,
    multiModal: options.multiModal,
    "boundary.country": options.boundaryCountry,
    "boundary.county_ids": options.boundaryCountyIds,
  });

  return `${baseUrl}/autocomplete?${params}`;
};

export const useAutoCompleteV1 = (options: AutoCompleteV1Options) => {
  const { env, size = 30, ...rest } = options;

  const url = useMemo(() => {
    const baseUrl = getV1BaseUrl(env);
    return buildAutoCompleteUrl(baseUrl, { ...rest, size });
  }, [env, size, rest.searchTerm, rest.focusLat, rest.focusLon, rest.focusScale, rest.focusWeight, rest.layers, rest.sources, rest.multiModal, rest.boundaryCountry, rest.boundaryCountyIds]);

  return useGeocoderFetch({ url, useLabel: true });
};

export const useAutoCompleteV2 = (options: AutoCompleteV2Options) => {
  const { env, size = 30, ...rest } = options;

  const url = useMemo(() => {
    const baseUrl = getV2BaseUrl(env);
    return buildAutoCompleteUrl(baseUrl, { ...rest, size });
  }, [env, size, rest.searchTerm, rest.focusLat, rest.focusLon, rest.focusScale, rest.focusWeight, rest.layers, rest.sources, rest.multiModal, rest.boundaryCountry, rest.boundaryCountyIds]);

  return useGeocoderFetch({ url, useLabel: true });
};
