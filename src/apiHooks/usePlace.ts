import { useMemo } from "react";
import { useGeocoderFetch } from "./useGeocoderFetch";
import { Env, getBaseUrl, buildQueryParams } from "./api";

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

  const url = useMemo(() => {
    const baseUrl = getBaseUrl(env);
    return buildPlaceUrl(baseUrl, ids);
  }, [ids, env]);

  return useGeocoderFetch({ url });
};
