import { useEffect, useState } from 'react';
import { FetchError, SearchResults, Properties, Result } from "./response.types";

export enum GeocoderVersion {
  V1 = 'v1',
  V2 = 'v2'
}

export const useAutoComplete = (searchTerm: string, version: GeocoderVersion) => {

  const [searchResults, setSearchResults] = useState<SearchResults>({ results: [] });
  const [error, setError] = useState<FetchError | undefined>();

  useEffect(() => {
    console.log("useAutoComplete");
    const timer = setTimeout(() => {
      if (searchTerm) {
        const fetchResults = async function () {
          const baseUrl = version === GeocoderVersion.V2 && import.meta.env.VITE_GEOCODER_V2_URL
            ? import.meta.env.VITE_GEOCODER_V2_URL
            : `https://api.dev.entur.io/geocoder/${version}`;
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
  }, [searchTerm, version]);

  return { searchResults, error };
};
