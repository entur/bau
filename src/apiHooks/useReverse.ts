import { useMemo } from "react";
import { useGeocoderFetch } from "./useGeocoderFetch";
import { GeocoderVersion, ApiEnvironment, getBaseUrl, buildQueryParams } from "./api";

export interface ReverseOptions {
  lat: string;
  lon: string;
  version: GeocoderVersion;
  environment?: ApiEnvironment;
  size?: number;
  layers?: string;
  sources?: string;
  multiModal?: string;
  boundaryCircleRadius?: string;
  v2url?: string;
}

export const useReverse = (options: ReverseOptions) => {
  const {
    lat,
    lon,
    version,
    environment = ApiEnvironment.DEV,
    size = 30,
    layers,
    sources,
    multiModal,
    boundaryCircleRadius,
    v2url,
  } = options;

  const url = useMemo(() => {
    if (!lat || !lon) return null;

    const baseUrl = getBaseUrl(version, environment, v2url);
    const params = buildQueryParams({
      "point.lat": lat,
      "point.lon": lon,
      lang: "no",
      size,
      layers,
      sources,
      multiModal,
      "boundary.circle.radius": boundaryCircleRadius,
    });

    return `${baseUrl}/reverse?${params}`;
  }, [lat, lon, version, environment, size, layers, sources, multiModal, boundaryCircleRadius, v2url]);

  return useGeocoderFetch({ url });
};
