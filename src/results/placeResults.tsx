import { V1Env, V2Env } from "../apiHooks/api";
import { usePlaceV1, usePlaceV2 } from "../apiHooks/usePlace";
import { useResultComparison } from "./useResultComparison";
import { ResultColumn } from "./ResultColumn";
import { MapContainerWrapper } from "../map/MapContainerWrapper";
import styles from "./results.module.scss";

interface Props {
  ids: string;
  v1Env: V1Env;
  v2Env: V2Env;
}

export const PlaceResults = ({
  ids,
  v1Env,
  v2Env,
}: Props) => {
  const resultsV1 = usePlaceV1({ ids, env: v1Env });
  const resultsV2 = usePlaceV2({ ids, env: v2Env });

  const showV1 = v1Env !== V1Env.OFF;
  const showV2 = v2Env !== V2Env.OFF;
  const showComparison = showV1 && showV2;

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
    !showComparison
  );

  const columnCount = (showV1 ? 1 : 0) + (showV2 ? 1 : 0) + 1;
  const gridColumns = columnCount === 3 ? "1fr 1fr 2fr" : columnCount === 2 ? "1fr 2fr" : "1fr";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridColumns,
        gap: "1rem",
        alignItems: "start",
      }}
      className={styles.resultsLayout}
    >
      {showV1 && (
        <ResultColumn
          version="v1"
          env={v1Env}
          searchResults={resultsV1.searchResults}
          error={resultsV1.error}
          queryUrl={resultsV1.queryUrl}
          missingResults={missingInV1}
          highlightedId={highlightedId}
          onResultHover={setHighlightedId}
          matchColors={matchColorsV1}
        />
      )}

      {showV2 && (
        <ResultColumn
          version="v2"
          env={v2Env}
          searchResults={resultsV2.searchResults}
          error={resultsV2.error}
          queryUrl={resultsV2.queryUrl}
          missingResults={missingInV2}
          highlightedId={highlightedId}
          onResultHover={setHighlightedId}
          matchColors={matchColorsV2}
        />
      )}

      <div>
        <MapContainerWrapper
          v1Results={resultsV1.searchResults.results}
          v2Results={resultsV2.searchResults.results}
        />
      </div>
    </div>
  );
};
