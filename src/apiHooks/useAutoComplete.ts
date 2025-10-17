import { useEffect, useState } from "react";
import {
  FetchError,
  SearchResults,
  Properties,
  Result,
} from "./response.types";

export enum GeocoderVersion {
  V1 = "v1",
  V2 = "v2",
}

export enum ApiEnvironment {
  DEV = "dev",
  STAGING = "staging",
  PROD = "prod",
}

const getApiUrl = (environment: ApiEnvironment): string => {
  switch (environment) {
    case ApiEnvironment.DEV:
      return "api.dev.entur.io";
    case ApiEnvironment.STAGING:
      return "api.staging.entur.io";
    case ApiEnvironment.PROD:
      return "api.entur.io";
  }
};

export const useAutoComplete = (
  searchTerm: string,
  version: GeocoderVersion,
  environment: ApiEnvironment = ApiEnvironment.DEV,
  size: number = 30,
  focusLat?: string,
  focusLon?: string,
) => {
  const [searchResults, setSearchResults] = useState<SearchResults>({
    results: [],
  });
  const [error, setError] = useState<FetchError | undefined>();

  useEffect(() => {
    console.log("useAutoComplete");
    const timer = setTimeout(() => {
      if (searchTerm) {
        const fetchResults = async function () {
          try {
            const apiUrl = getApiUrl(environment);
            const baseUrl =
              version === GeocoderVersion.V2 &&
              import.meta.env.VITE_GEOCODER_V2_URL
                ? import.meta.env.VITE_GEOCODER_V2_URL
                : `https://${apiUrl}/geocoder/${version}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const focusParams =
              focusLat && focusLon
                ? `&focus.point.lat=${focusLat}&focus.point.lon=${focusLon}`
                : "";
            const response = await fetch(
              `${baseUrl}/autocomplete?lang=no&size=${size}&text=${searchTerm}${focusParams}`,
              { signal: controller.signal },
            );

            clearTimeout(timeoutId);

            if (response.ok) {
              const result = await response.json();

              // Define Feature interface for better type safety
              interface GeoJSONFeature {
                properties: Properties;
                geometry?: {
                  type: "Point";
                  coordinates: [number, number];
                };
              }

              const results: Result[] = result.features.map(
                (feature: GeoJSONFeature) => ({
                  name: feature.properties.name,
                  layer: feature.properties.layer,
                  categories: feature.properties.category,
                  properties: feature.properties,
                  geometry: feature.geometry, // NEW: Capture geometry
                }),
              );

              setSearchResults({ results: results });
              setError(undefined);
            } else {
              setError({
                status: response.status,
                statusText: response.statusText,
              });
              setSearchResults({ results: [] });
            }
          } catch (err) {
            const errorMessage =
              err instanceof Error && err.name === "AbortError"
                ? "Request timeout"
                : err instanceof Error
                  ? err.message
                  : "Network error";
            setError({
              status: 0,
              statusText: errorMessage,
            });
            setSearchResults({ results: [] });
          }
        };
        fetchResults();
      } else {
        setSearchResults({ results: [] });
        setError(undefined);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, version, environment, size, focusLat, focusLon]);

  return { searchResults, error };
};
