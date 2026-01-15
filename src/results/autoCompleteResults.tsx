import {
  GeocoderVersion,
  useAutoComplete,
  ApiEnvironment,
} from "../apiHooks/useAutoComplete";
import { useEffect, useState } from "react";
import { Results } from "./results";
import { Heading3 } from "@entur/typography";
import styles from "./results.module.scss";
import { getMatchColor } from "../utils/colorHash";
import { MapContainerWrapper } from "../map/MapContainerWrapper";
import { Feature } from "../apiHooks/response.types";

interface Props {
  searchTerm: string;
  environment: ApiEnvironment;
  size?: number;
  focusLat?: string;
  focusLon?: string;
  focusScale?: string;
  focusWeight?: string;
  layers?: string;
  sources?: string;
  multiModal?: string;
  boundaryCountry?: string;
  boundaryCountyIds?: string;
  onFocusChange?: (lat: string, lon: string) => void;
}

export const AutoCompleteResults = ({
  searchTerm,
  environment,
  size = 30,
  focusLat,
  focusLon,
  focusScale,
  focusWeight,
  layers,
  sources,
  multiModal,
  boundaryCountry,
  boundaryCountyIds,
  onFocusChange = () => {},
}: Props) => {
  const resultsV1 = useAutoComplete(
    searchTerm,
    GeocoderVersion.V1,
    environment,
    size,
    focusLat,
    focusLon,
    focusScale,
    focusWeight,
    layers,
    sources,
    multiModal,
    boundaryCountry,
    boundaryCountyIds,
  );
  const resultsV2 = useAutoComplete(
    searchTerm,
    GeocoderVersion.V2,
    environment,
    size,
    focusLat,
    focusLon,
    focusScale,
    focusWeight,
    layers,
    sources,
    multiModal,
    boundaryCountry,
    boundaryCountyIds,
  );

  const [missingResultIdInV1, setMissingResultIdsInV1] = useState<string[]>([]);
  const [missingResultIdInV2, setMissingResultIdsInV2] = useState<string[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Calculate match colors for visual pairing
  const matchColorsV1 = new Map<string, string>();
  const matchColorsV2 = new Map<string, string>();

  resultsV1.searchResults.results.forEach((result) => {
    matchColorsV1.set(
      result.properties.id,
      getMatchColor(
        result.properties.id,
        resultsV2.searchResults.results,
        missingResultIdInV1.includes(result.properties.id),
      ),
    );
  });

  resultsV2.searchResults.results.forEach((result) => {
    matchColorsV2.set(
      result.properties.id,
      getMatchColor(
        result.properties.id,
        resultsV1.searchResults.results,
        missingResultIdInV2.includes(result.properties.id),
      ),
    );
  });

  useEffect(() => {
    setMissingResultIdsInV1(
      resultsV1.searchResults.results
        .map((result1) => result1.properties.id)
        .filter(
          (id1) =>
            !resultsV2.searchResults.results.some((result2) =>
              result2.properties.id.includes(id1),
            ),
        ),
    );
    setMissingResultIdsInV2(
      resultsV2.searchResults.results
        .map((result2) => result2.properties.id)
        .filter(
          (id2) =>
            !resultsV1.searchResults.results.some((result1) =>
              result1.properties.id.includes(id2),
            ),
        ),
    );
  }, [resultsV1.searchResults.results, resultsV2.searchResults.results]);

  const featuresV1: Feature[] = resultsV1.searchResults.results.map((r) => ({
    ...r,
    type: "Feature",
  }));
  const featuresV2: Feature[] = resultsV2.searchResults.results.map((r) => ({
    ...r,
    type: "Feature",
  }));

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 2fr",
          gap: "1rem",
          alignItems: "start",
        }}
        className={styles.resultsLayout}
      >
        {/* V1 Column */}
        <div>
          <div className={styles.resultsContainer}>
            <Heading3 className={styles.resultsHeading}>
              Geocoder - {GeocoderVersion.V1}
              {resultsV1.queryUrl && (
                <a
                  href={`${resultsV1.queryUrl}&debug=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginLeft: "0.5rem",
                    fontSize: "0.75rem",
                    fontWeight: "normal",
                    textDecoration: "none",
                    color: "#0b91ef",
                  }}
                >
                  [debug]
                </a>
              )}
            </Heading3>
            <Results
              searchResults={resultsV1.searchResults}
              loading={resultsV1.loading}
              error={resultsV1.error}
              missingResults={missingResultIdInV1}
              highlightedId={highlightedId}
              onResultHover={setHighlightedId}
              matchColors={matchColorsV1}
              onFocusChange={onFocusChange}
            />
          </div>
        </div>

        {/* V2 Column */}
        <div>
          <div className={styles.resultsContainer}>
            <Heading3 className={styles.resultsHeading}>
              Geocoder - {GeocoderVersion.V2}
              {resultsV2.queryUrl && (
                <a
                  href={`${resultsV2.queryUrl}&debug=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginLeft: "0.5rem",
                    fontSize: "0.75rem",
                    fontWeight: "normal",
                    textDecoration: "none",
                    color: "#0b91ef",
                  }}
                >
                  [debug]
                </a>
              )}
            </Heading3>
            <Results
              searchResults={resultsV2.searchResults}
              loading={resultsV2.loading}
              error={resultsV2.error}
              missingResults={missingResultIdInV2}
              highlightedId={highlightedId}
              onResultHover={setHighlightedId}
              matchColors={matchColorsV2}
              onFocusChange={onFocusChange}
            />
          </div>
        </div>

        {/* Map Column */}
        <div>
          <MapContainerWrapper
            v1Results={featuresV1}
            v2Results={featuresV2}
            focusPoint={
              focusLat && focusLon
                ? {
                    lat: parseFloat(focusLat),
                    lon: parseFloat(focusLon),
                  }
                : undefined
            }
            onFocusPointChange={(lat, lon) => {
              onFocusChange?.(lat.toString(), lon.toString());
            }}
          />
        </div>
      </div>
    </>
  );
};
