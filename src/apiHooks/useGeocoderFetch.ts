import { useEffect, useState } from "react";
import { FetchError, SearchResults, Result } from "./response.types";
import { parseGeocoderResponse } from "./api";

const DEBOUNCE_MS = 200;
const TIMEOUT_MS = 10000;

interface UseGeocoderFetchOptions {
  url: string | null;
  useLabel?: boolean;
}

interface UseGeocoderFetchResult {
  searchResults: SearchResults;
  error: FetchError | undefined;
  queryUrl: string;
}

export const useGeocoderFetch = ({
  url,
  useLabel = false,
}: UseGeocoderFetchOptions): UseGeocoderFetchResult => {
  const [searchResults, setSearchResults] = useState<SearchResults>({ results: [] });
  const [error, setError] = useState<FetchError | undefined>();
  const [queryUrl, setQueryUrl] = useState<string>("");

  useEffect(() => {
    if (!url) {
      setSearchResults({ results: [] });
      setError(undefined);
      return;
    }

    const timer = setTimeout(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        setQueryUrl(url);
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { "ET-Client-Name": "entur-ror-bau" },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const results: Result[] = parseGeocoderResponse(data, useLabel);
          setSearchResults({ results });
          setError(undefined);
        } else {
          setError({ status: response.status, statusText: response.statusText });
          setSearchResults({ results: [] });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error && err.name === "AbortError"
            ? "Request timeout"
            : err instanceof Error
              ? err.message
              : "Network error";
        setError({ status: 0, statusText: errorMessage });
        setSearchResults({ results: [] });
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [url, useLabel]);

  return { searchResults, error, queryUrl };
};
