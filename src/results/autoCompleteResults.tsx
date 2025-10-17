import {
  GeocoderVersion,
  useAutoComplete,
  ApiEnvironment,
} from "../apiHooks/useAutoComplete";
import { useEffect, useState } from "react";
import { GridContainer, GridItem } from "@entur/grid";
import { Results } from "./results";
import { Heading3 } from "@entur/typography";
import styles from "./results.module.scss";
import { getMatchColor } from "../utils/colorHash";
import { MapContainerWrapper } from "../map/MapContainerWrapper";

interface Props {
  searchTerm: string;
  environment: ApiEnvironment;
}

export const AutoCompleteResults = ({ searchTerm, environment }: Props) => {
  const resultsV1 = useAutoComplete(
    searchTerm,
    GeocoderVersion.V1,
    environment,
  );
  const resultsV2 = useAutoComplete(
    searchTerm,
    GeocoderVersion.V2,
    environment,
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
      {/* Geographic Distribution Map */}
      <MapContainerWrapper
        v1Results={resultsV1.searchResults.results}
        v2Results={resultsV2.searchResults.results}
      />
      <GridContainer spacing="none">
        <GridItem small={4}>
          <div className={styles.resultsContainer}>
            <Heading3 className={styles.resultsHeading}>
              Geocoder - {GeocoderVersion.V1}
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
        </GridItem>
        <GridItem small={4}>
          <div className={styles.resultsContainer}>
            <Heading3 className={styles.resultsHeading}>
              Geocoder - {GeocoderVersion.V2}
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
        </GridItem>
      </GridContainer>
    </>
  );
};
