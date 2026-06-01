import { useMemo } from "react";
import { useGeocoderFetch } from "./useGeocoderFetch";
import { Env, V3Params, getApiVersion, getBaseUrl, buildQueryParams, v3FilterParams } from "./api";

export interface AutoCompleteOptions {
  searchTerm: string;
  env: Env;
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
  // v3-specific knobs (text, size and focus point are shared with v2 above)
  v3?: V3Params;
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

const buildV3AutocompleteUrl = (baseUrl: string | null, options: {
  q: string;
  limit: number;
  lat?: string;
  lon?: string;
  radius?: string;
  weight?: string;
  layers?: string;
  sources?: string;
  multimodal?: string;
  countries?: string;
  counties?: string;
}): string | null => {
  if (!options.q || !baseUrl) return null;

  // lat, lon, radius and weight are a bundle in v3: sending radius/weight without
  // both lat and lon is a 400, so only emit the focus params when the point is set.
  const hasFocus = !!options.lat && !!options.lon;

  const params = buildQueryParams({
    lang: "no",
    limit: options.limit,
    q: options.q,
    lat: hasFocus ? options.lat : undefined,
    lon: hasFocus ? options.lon : undefined,
    radius: hasFocus ? options.radius : undefined,
    weight: hasFocus ? options.weight : undefined,
    ...v3FilterParams(options),
  });

  return `${baseUrl}/autocomplete?${params}`;
};

export const useAutoComplete = (options: AutoCompleteOptions) => {
  const { env, size = 30, ...rest } = options;
  const version = getApiVersion(env);

  const url = useMemo(() => {
    const baseUrl = getBaseUrl(env);
    if (version === "v3") {
      return buildV3AutocompleteUrl(baseUrl, {
        q: rest.searchTerm,
        limit: size,
        lat: rest.focusLat,
        lon: rest.focusLon,
        radius: rest.v3?.radius,
        weight: rest.v3?.weight,
        layers: rest.v3?.layers,
        sources: rest.v3?.sources,
        multimodal: rest.multiModal,
        countries: rest.v3?.countries,
        counties: rest.v3?.counties,
      });
    }
    return buildAutoCompleteUrl(baseUrl, { ...rest, size });
  }, [env, version, size, rest.searchTerm, rest.focusLat, rest.focusLon, rest.focusScale, rest.focusWeight, rest.layers, rest.sources, rest.multiModal, rest.boundaryCountry, rest.boundaryCountyIds, rest.v3]);

  return useGeocoderFetch({ url, useLabel: true, version });
};
