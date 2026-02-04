import { useMemo } from "react";
import { useGeocoderFetch } from "./useGeocoderFetch";
import { GeocoderVersion, ApiEnvironment, getBaseUrl, buildQueryParams } from "./api";

export { GeocoderVersion, ApiEnvironment } from "./api";

export interface AutoCompleteOptions {
  searchTerm: string;
  version: GeocoderVersion;
  environment?: ApiEnvironment;
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
  v2url?: string;
}

export const useAutoComplete = (options: AutoCompleteOptions) => {
  const {
    searchTerm,
    version,
    environment = ApiEnvironment.DEV,
    size = 30,
    focusLat,
    focusLon,
    focusScale,
    focusWeight,
    layers,
    sources,
    multiModal,
    boundaryCountry,
    boundaryCountyIds,
    v2url,
  } = options;

  const url = useMemo(() => {
    if (!searchTerm) return null;

    const baseUrl = getBaseUrl(version, environment, v2url);
    const params = buildQueryParams({
      lang: "no",
      size,
      text: searchTerm,
      "focus.point.lat": focusLat,
      "focus.point.lon": focusLon,
      "focus.scale": focusScale,
      "focus.weight": focusWeight,
      layers,
      sources,
      multiModal,
      "boundary.country": boundaryCountry,
      "boundary.county_ids": boundaryCountyIds,
    });

    return `${baseUrl}/autocomplete?${params}`;
  }, [searchTerm, version, environment, size, focusLat, focusLon, focusScale, focusWeight, layers, sources, multiModal, boundaryCountry, boundaryCountyIds, v2url]);

  return useGeocoderFetch({ url, useLabel: true });
};
