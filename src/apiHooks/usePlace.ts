import { useMemo } from "react";
import { useGeocoderFetch } from "./useGeocoderFetch";
import { GeocoderVersion, ApiEnvironment, getBaseUrl, buildQueryParams } from "./api";

export interface PlaceOptions {
  ids: string;
  version: GeocoderVersion;
  environment?: ApiEnvironment;
  v2url?: string;
}

export const usePlace = (options: PlaceOptions) => {
  const {
    ids,
    version,
    environment = ApiEnvironment.DEV,
    v2url,
  } = options;

  const url = useMemo(() => {
    if (!ids) return null;

    const baseUrl = getBaseUrl(version, environment, v2url);
    const params = buildQueryParams({
      ids,
      lang: "no",
    });

    return `${baseUrl}/place?${params}`;
  }, [ids, version, environment, v2url]);

  return useGeocoderFetch({ url });
};
