import { V1Env, V2Env } from "../apiHooks/api";
import { useReverseV1, useReverseV2 } from "../apiHooks/useReverse";
import { useResultComparison } from "./useResultComparison";
import { ResultColumn } from "./ResultColumn";
import { MapContainerWrapper } from "../map/MapContainerWrapper";
import styles from "./results.module.scss";

interface Props {
  lat: string;
  lon: string;
  v1Env: V1Env;
  v2Env: V2Env;
  size?: number;
  layers?: string;
  sources?: string;
  multiModal?: string;
  boundaryCircleRadius?: string;
  onPointChange?: (lat: string, lon: string) => void;
}

export const ReverseResults = ({
  lat,
  lon,
  v1Env,
  v2Env,
  size = 30,
  layers,
  sources,
  multiModal,
  boundaryCircleRadius,
  onPointChange,
}: Props) => {
  const commonOptions = {
    lat,
    lon,
    size,
    layers,
    sources,
    multiModal,
    boundaryCircleRadius,
  };

  const resultsV1 = useReverseV1({ env: v1Env, ...commonOptions });
  const resultsV2 = useReverseV2({ env: v2Env, ...commonOptions });

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
          reversePoint={
            lat && lon
              ? { lat: parseFloat(lat), lon: parseFloat(lon) }
              : undefined
          }
          onReversePointChange={(newLat, newLon) => {
            onPointChange?.(newLat.toString(), newLon.toString());
          }}
        />
      </div>
    </div>
  );
};
