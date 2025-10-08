import { useEffect, useState } from 'react';
import { FetchError, SearchResults, Properties, Result } from "./response.types";
import { GeocoderVersion } from "./useAutoComplete";

export const useReverse = (lat: string, lon: string, version: GeocoderVersion) => {

  const [searchResults, setSearchResults] = useState<SearchResults>({ results: [] });
  const [error, setError] = useState<FetchError | undefined>();

  useEffect(() => {
    console.log("useReverse");
    const timer = setTimeout(() => {
      if (lat && lon) {
        const fetchResults = async function () {
          const baseUrl = version === GeocoderVersion.V2 && import.meta.env.VITE_GEOCODER_V2_URL
            ? import.meta.env.VITE_GEOCODER_V2_URL
            : `https://api.dev.entur.io/geocoder/${version}`;
          const response = await fetch(
            `${baseUrl}/reverse?point.lat=${lat}&point.lon=${lon}&lang=no&size=30`
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
  }, [lat, lon, version]);

  return { searchResults, error };
};

