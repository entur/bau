import { GeocoderVersion, ApiEnvironment } from "../apiHooks/api";
import { usePlace } from "../apiHooks/usePlace";
import { useResultComparison } from "./useResultComparison";
import { ResultColumn } from "./ResultColumn";
import { MapContainerWrapper } from "../map/MapContainerWrapper";
import styles from "./results.module.scss";

interface Props {
  ids: string;
  environment: ApiEnvironment;
  v2only?: boolean;
  v2url?: string;
}

export const PlaceResults = ({
  ids,
  environment,
  v2only = false,
  v2url,
}: Props) => {
  const resultsV1 = usePlace({
    ids: v2only ? "" : ids,
    version: GeocoderVersion.V1,
    environment,
  });

  const resultsV2 = usePlace({
    ids,
    version: GeocoderVersion.V2,
    environment,
    v2url,
  });

  const {
    missingInV1,
    missingInV2,
    matchColorsV1,
    matchColorsV2,
    highlightedId,
    setHighlightedId,
  } = useResultComparison(
    resultsV1.searchResults.results,
    resultsV2.searchResults.results,
    v2only
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: v2only ? "1fr 2fr" : "1fr 1fr 2fr",
        gap: "1rem",
        alignItems: "start",
      }}
      className={styles.resultsLayout}
    >
      {!v2only && (
        <ResultColumn
          version={GeocoderVersion.V1}
          searchResults={resultsV1.searchResults}
          error={resultsV1.error}
          queryUrl={resultsV1.queryUrl}
          missingResults={missingInV1}
          highlightedId={highlightedId}
          onResultHover={setHighlightedId}
          matchColors={matchColorsV1}
        />
      )}

      <ResultColumn
        version={GeocoderVersion.V2}
        searchResults={resultsV2.searchResults}
        error={resultsV2.error}
        queryUrl={resultsV2.queryUrl}
        missingResults={missingInV2}
        highlightedId={highlightedId}
        onResultHover={setHighlightedId}
        matchColors={matchColorsV2}
        hideVersion={v2only}
      />

      <div>
        <MapContainerWrapper
          v1Results={resultsV1.searchResults.results}
          v2Results={resultsV2.searchResults.results}
        />
      </div>
    </div>
  );
};
