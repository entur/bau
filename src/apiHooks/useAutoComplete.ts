import { useEffect, useState } from 'react';
import { FetchError, SearchResults, Properties, Result } from "./response.types";

export enum GeocoderVersion {
  V1 = 'v1',
  V2 = 'v2'
}

export enum ApiEnvironment {
  DEV = 'dev',
  STAGING = 'staging',
  PROD = 'prod'
}

const getApiUrl = (environment: ApiEnvironment): string => {
  switch (environment) {
    case ApiEnvironment.DEV:
      return 'api.dev.entur.io';
    case ApiEnvironment.STAGING:
      return 'api.staging.entur.io';
    case ApiEnvironment.PROD:
      return 'api.entur.io';
  }
};

export const useAutoComplete = (searchTerm: string, version: GeocoderVersion, environment: ApiEnvironment = ApiEnvironment.DEV) => {

  const [searchResults, setSearchResults] = useState<SearchResults>({ results: [] });
  const [error, setError] = useState<FetchError | undefined>();

  useEffect(() => {
    console.log("useAutoComplete");
    const timer = setTimeout(() => {
      if (searchTerm) {
        const fetchResults = async function () {
          const apiUrl = getApiUrl(environment);
          const baseUrl = version === GeocoderVersion.V2 && import.meta.env.VITE_GEOCODER_V2_URL
            ? import.meta.env.VITE_GEOCODER_V2_URL
            : `https://${apiUrl}/geocoder/${version}`;
          const response = await fetch(
            `${baseUrl}/autocomplete?lang=no&size=30&text=${searchTerm}`
          );
          if (response.ok) {
            const result = await response.json();
            const results: Result[] = result.features
                                            .map((feature: { properties: { name: string } }) => feature.properties)
                                            .map((properties: Properties) => ({
                                              name: properties.name,
                                              layer: properties.layer,
                                              categories: properties.category,
                                              properties: properties
                                            }));

            setSearchResults({ results: results });
          } else {
            setError({
              status: response.status,
              statusText: response.statusText,
            });
          }
        };
        fetchResults();
      } else {
        setSearchResults({ results: [] })
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, version, environment]);

  return { searchResults, error };
};
