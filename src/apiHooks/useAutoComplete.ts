import { useEffect, useState } from 'react';
import { FetchError, SearchResults } from "./response.types";

export enum GeocoderVersion {
  V1 = 'v1',
  V2 = 'v2'
}

export const useAutoComplete = (searchTerm: string, version: GeocoderVersion) => {

  const [searchResults, setSearchResults] = useState<SearchResults>({ names: [] });
  const [v1Error, setV1Error] = useState<FetchError | undefined>();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        const fetchResults = async function () {
          const response = await fetch(
            `https://api.dev.entur.io/geocoder/${version}/autocomplete?lang=no&size=30&text=${searchTerm}`
          );
          if (response.ok) {
            const result = await response.json();
            const names = result.features
                                .map((feature: { properties: { name: string } }) => feature.properties)
                                .map((properties: { name: string }) => properties.name)
            setSearchResults({ names: names });
          } else {
            setV1Error({
              status: response.status,
              statusText: response.statusText,
            });
          }
        };
        fetchResults();
      } else {
        setSearchResults({ names: [] })
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, version]);

  return { searchResults, v1Error };
};
