import { useEffect, useState } from "react";
import {
  FetchError,
  SearchResults,
  Properties,
  Result,
} from "./response.types";
import { GeocoderVersion, ApiEnvironment } from "./useAutoComplete";

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

export const useReverse = (
  lat: string,
  lon: string,
  version: GeocoderVersion,
  environment: ApiEnvironment = ApiEnvironment.DEV,
) => {
  const [searchResults, setSearchResults] = useState<SearchResults>({
    results: [],
  });
  const [error, setError] = useState<FetchError | undefined>();

  useEffect(() => {
    console.log("useReverse");
    const timer = setTimeout(() => {
      if (lat && lon) {
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

            const response = await fetch(
              `${baseUrl}/reverse?point.lat=${lat}&point.lon=${lon}&lang=no&size=30`,
              { signal: controller.signal },
            );

            clearTimeout(timeoutId);

            if (response.ok) {
              const result = await response.json();
              const results: Result[] = result.features
                .map(
                  (feature: { properties: { name: string } }) =>
                    feature.properties,
                )
                .map((properties: Properties) => ({
                  name: properties.name,
                  layer: properties.layer,
                  categories: properties.category,
                  properties: properties,
                }));

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
  }, [lat, lon, version, environment]);

  return { searchResults, error };
};
