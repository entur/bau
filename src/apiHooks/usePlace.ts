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

export const usePlace = (
  ids: string,
  version: GeocoderVersion,
  environment: ApiEnvironment = ApiEnvironment.DEV,
  v2url?: string,
) => {
  const [searchResults, setSearchResults] = useState<SearchResults>({
    results: [],
  });
  const [error, setError] = useState<FetchError | undefined>();
  const [queryUrl, setQueryUrl] = useState<string>("");

  useEffect(() => {
    console.log("usePlace");
    const timer = setTimeout(() => {
      if (ids) {
        const fetchResults = async function () {
          try {
            const apiUrl = getApiUrl(environment);
            const baseUrl =
              version === GeocoderVersion.V2 && (v2url || import.meta.env.VITE_GEOCODER_V2_URL)
                ? (v2url || import.meta.env.VITE_GEOCODER_V2_URL)
                : `https://${apiUrl}/geocoder/${version}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const url = `${baseUrl}/place?ids=${encodeURIComponent(ids)}&lang=no`;
            setQueryUrl(url);
            const response = await fetch(
              url,
              {
                signal: controller.signal,
                headers: {
                  "ET-Client-Name": "entur-ror-bau",
                },
              },
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
                  geometry: feature.geometry,
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
  }, [ids, version, environment, v2url]);

  return { searchResults, error, queryUrl };
};
