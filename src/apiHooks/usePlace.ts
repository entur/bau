import { useMemo } from "react";
import { useGeocoderFetch } from "./useGeocoderFetch";
import { V1Env, V2Env, getV1BaseUrl, getV2BaseUrl, buildQueryParams } from "./api";

export interface PlaceV1Options {
  ids: string;
  env: V1Env;
}

export interface PlaceV2Options {
  ids: string;
  env: V2Env;
}

const buildPlaceUrl = (baseUrl: string | null, ids: string): string | null => {
  if (!ids || !baseUrl) return null;

  const params = buildQueryParams({
    ids,
    lang: "no",
  });

  return `${baseUrl}/place?${params}`;
};

export const usePlaceV1 = (options: PlaceV1Options) => {
  const { ids, env } = options;

  const url = useMemo(() => {
    const baseUrl = getV1BaseUrl(env);
    return buildPlaceUrl(baseUrl, ids);
  }, [ids, env]);

  return useGeocoderFetch({ url });
};

export const usePlaceV2 = (options: PlaceV2Options) => {
  const { ids, env } = options;

  const url = useMemo(() => {
    const baseUrl = getV2BaseUrl(env);
    return buildPlaceUrl(baseUrl, ids);
  }, [ids, env]);

  return useGeocoderFetch({ url });
};
