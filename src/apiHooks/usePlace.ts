import { useState, useEffect } from "react";
import { Feature, FeatureCollection } from "./response.types";
import { ApiEnvironment } from "./useAutoComplete";

export enum GeocoderVersion {
  V1 = "v1",
  V2 = "v2",
}

const V1_URLS = {
  [ApiEnvironment.DEV]: "https://api.dev.entur.io/geocoder/v1/place",
  [ApiEnvironment.STAGING]: "https://api.staging.entur.io/geocoder/v1/place",
  [ApiEnvironment.PROD]: "https://api.entur.io/geocoder/v1/place",
};

const V2_URLS = {
  [ApiEnvironment.DEV]: "https://api.dev.entur.io/geocoder/v2/place",
  [ApiEnvironment.STAGING]: "https://api.staging.entur.io/geocoder/v2/place",
  [ApiEnvironment.PROD]: "https://api.entur.io/geocoder/v2/place",
};

type UsePlaceProps = {
  ids: string;
  environment: ApiEnvironment;
  version: GeocoderVersion;
};

export function usePlace({ ids, environment, version }: UsePlaceProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ status: number; statusText: string } | null>(null);
  const [queryUrl, setQueryUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!ids) {
      setFeatures([]);
      setQueryUrl(null);
      return;
    }

    const urls = version === GeocoderVersion.V1 ? V1_URLS : V2_URLS;
    const url = new URL(urls[environment]);
    url.searchParams.set("ids", ids);
    setQueryUrl(url.toString());

    const controller = new AbortController();

    const fetchUrl = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url.toString(), {
          signal: controller.signal,
        });
        if (!response.ok) {
          setError({ status: response.status, statusText: response.statusText });
          setFeatures([]); // Clear features on error
          return;
        }
        const data = (await response.json()) as FeatureCollection;
        setFeatures(data.features);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError({ status: 0, statusText: e.message });
          setFeatures([]); // Clear features on error
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();

    return () => {
      controller.abort();
    };
  }, [ids, environment, version]);

  return { features, loading, error, queryUrl };
}

export { ApiEnvironment };
