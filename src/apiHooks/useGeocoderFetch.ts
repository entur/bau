import { useEffect, useState } from "react";
import { FetchError, SearchResults, Result } from "./response.types";
import { ApiVersion, parseGeocoderResponse, parseV3Response } from "./api";

const DEBOUNCE_MS = 200;
const TIMEOUT_MS = 10000;

interface UseGeocoderFetchOptions {
  url: string | null;
  useLabel?: boolean;
  version?: ApiVersion;
}

export interface UseGeocoderFetchResult {
  searchResults: SearchResults;
  error: FetchError | undefined;
  queryUrl: string;
}

export const useGeocoderFetch = ({
  url,
  useLabel = false,
  version = "v2",
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
          const results: Result[] =
            version === "v3"
              ? parseV3Response(data, useLabel)
              : parseGeocoderResponse(data, useLabel);
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
  }, [url, useLabel, version]);

  return { searchResults, error, queryUrl };
};
