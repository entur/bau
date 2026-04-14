import { Env } from "../apiHooks/api";
import { useAutoComplete } from "../apiHooks/useAutoComplete";
import { useResultComparison } from "./useResultComparison";
import { ResultColumn } from "./ResultColumn";
import { MapContainerWrapper } from "../map/MapContainerWrapper";
import styles from "./results.module.scss";

interface Props {
  searchTerm: string;
  leftEnv: Env;
  rightEnv: Env;
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
  leftEnv,
  rightEnv,
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
  onFocusChange,
}: Props) => {
  const commonOptions = {
    searchTerm,
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
  };

  const leftResults = useAutoComplete({ env: leftEnv, ...commonOptions });
  const rightResults = useAutoComplete({ env: rightEnv, ...commonOptions });

  const showLeft = leftEnv !== Env.OFF;
  const showRight = rightEnv !== Env.OFF;
  const showComparison = showLeft && showRight;

  const {
    missingInLeft,
    missingInRight,
    matchColorsLeft,
    matchColorsRight,
    highlightedId,
    setHighlightedId,
  } = useResultComparison(
    leftResults.searchResults.results,
    rightResults.searchResults.results,
    !showComparison
  );

  const columnCount = (showLeft ? 1 : 0) + (showRight ? 1 : 0) + 1;
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
      {showLeft && (
        <ResultColumn
          label="Left"
          env={leftEnv}
          searchResults={leftResults.searchResults}
          error={leftResults.error}
          queryUrl={leftResults.queryUrl}
          missingResults={missingInLeft}
          highlightedId={highlightedId}
          onResultHover={setHighlightedId}
          matchColors={matchColorsLeft}
        />
      )}

      {showRight && (
        <ResultColumn
          label="Right"
          env={rightEnv}
          searchResults={rightResults.searchResults}
          error={rightResults.error}
          queryUrl={rightResults.queryUrl}
          missingResults={missingInRight}
          highlightedId={highlightedId}
          onResultHover={setHighlightedId}
          matchColors={matchColorsRight}
        />
      )}

      <div>
        <MapContainerWrapper
          leftResults={leftResults.searchResults.results}
          rightResults={rightResults.searchResults.results}
          focusPoint={
            focusLat && focusLon
              ? { lat: parseFloat(focusLat), lon: parseFloat(focusLon) }
              : undefined
          }
          onFocusPointChange={(lat, lon) => {
            onFocusChange?.(lat.toString(), lon.toString());
          }}
        />
      </div>
    </div>
  );
};
