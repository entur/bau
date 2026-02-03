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
  v2only?: boolean;
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
  v2only = false,
  onFocusChange,
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

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: v2only ? "1fr 2fr" : "1fr 1fr 2fr",
          gap: "1rem",
          alignItems: "start",
        }}
        className={styles.resultsLayout}
      >
        {/* V1 Column */}
        {!v2only && <div>
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
            {resultsV1.error && (
              <div
                style={{
                  backgroundColor: "#f8d7da",
                  border: "1px solid #f5c6cb",
                  borderRadius: "4px",
                  padding: "0.75rem",
                  marginBottom: "1rem",
                  color: "#721c24",
                  fontSize: "0.9rem",
                }}
              >
                <strong>⚠️ Endpoint Error:</strong> {resultsV1.error.statusText}
                {resultsV1.error.status > 0 &&
                  ` (HTTP ${resultsV1.error.status})`}
                <div style={{ marginTop: "0.25rem", fontSize: "0.85rem" }}>
                  Showing empty result
                </div>
              </div>
            )}
            <Results
              searchResults={resultsV1.searchResults}
              missingResults={missingResultIdInV1}
              highlightedId={highlightedId}
              onResultHover={setHighlightedId}
              matchColors={matchColorsV1}
            />
          </div>
        </div>}

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
            {resultsV2.error && (
              <div
                style={{
                  backgroundColor: "#f8d7da",
                  border: "1px solid #f5c6cb",
                  borderRadius: "4px",
                  padding: "0.75rem",
                  marginBottom: "1rem",
                  color: "#721c24",
                  fontSize: "0.9rem",
                }}
              >
                <strong>⚠️ Endpoint Error:</strong> {resultsV2.error.statusText}
                {resultsV2.error.status > 0 &&
                  ` (HTTP ${resultsV2.error.status})`}
                <div style={{ marginTop: "0.25rem", fontSize: "0.85rem" }}>
                  Showing empty result
                </div>
              </div>
            )}
            <Results
              searchResults={resultsV2.searchResults}
              missingResults={missingResultIdInV2}
              highlightedId={highlightedId}
              onResultHover={setHighlightedId}
              matchColors={matchColorsV2}
            />
          </div>
        </div>

        {/* Map Column */}
        <div>
          <MapContainerWrapper
            v1Results={resultsV1.searchResults.results}
            v2Results={resultsV2.searchResults.results}
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
