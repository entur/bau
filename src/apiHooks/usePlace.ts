import { useMemo } from "react";
import { useGeocoderFetch } from "./useGeocoderFetch";
import { Env, getApiVersion, getBaseUrl, buildQueryParams } from "./api";

export interface PlaceOptions {
  ids: string;
  env: Env;
}

const buildPlaceUrl = (baseUrl: string | null, ids: string): string | null => {
  if (!ids || !baseUrl) return null;

  const params = buildQueryParams({
    ids,
    lang: "no",
  });

  return `${baseUrl}/place?${params}`;
};

export const usePlace = (options: PlaceOptions) => {
  const { ids, env } = options;
  const version = getApiVersion(env);

  const url = useMemo(() => {
    const baseUrl = getBaseUrl(env);
    // /place takes the same params in both versions; only the id format and the
    // response shape differ, and getBaseUrl already points at the right /v2 or /v3 path.
    return buildPlaceUrl(baseUrl, ids);
  }, [ids, env]);

  return useGeocoderFetch({ url, version });
};
