import { ReactNode, type CSSProperties } from "react";
import { Env } from "../apiHooks/api";
import { UseGeocoderFetchResult } from "../apiHooks/useGeocoderFetch";
import { useResultComparison } from "./useResultComparison";
import { ResultColumn } from "./ResultColumn";
import styles from "./results.module.scss";

interface Props {
  leftEnv: Env;
  rightEnv: Env;
  onLeftEnvChange: (env: Env) => void;
  onRightEnvChange: (env: Env) => void;
  leftResults: UseGeocoderFetchResult;
  rightResults: UseGeocoderFetchResult;
  // Fills the third (map) cell; gets the hovered result id so the map can highlight it.
  map: (highlightedId: string | null) => ReactNode;
}

/**
 * The two-column + map layout shared by every search mode: it owns the active/off flags,
 * the left-vs-right comparison, and the grid. Each mode only supplies its fetched results
 * and its own map.
 */
export const ComparisonLayout = ({
  leftEnv,
  rightEnv,
  onLeftEnvChange,
  onRightEnvChange,
  leftResults,
  rightResults,
  map,
}: Props) => {
  const leftActive = leftEnv !== Env.OFF;
  const rightActive = rightEnv !== Env.OFF;
  const showComparison = leftActive && rightActive;

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

  // Per-side track width; results.module.scss builds the grid template from these (an "off"
  // side collapses to its dropdown, a live side takes an equal 1fr share).
  const columnWidths = {
    "--left-col": leftActive ? "1fr" : "auto",
    "--right-col": rightActive ? "1fr" : "auto",
  } as CSSProperties;

  return (
    <div className={styles.resultsLayout} style={columnWidths}>
      <ResultColumn
        side="Left"
        env={leftEnv}
        onEnvChange={onLeftEnvChange}
        searchResults={leftResults.searchResults}
        error={leftResults.error}
        queryUrl={leftResults.queryUrl}
        missingResults={missingInLeft}
        highlightedId={highlightedId}
        onResultHover={setHighlightedId}
        matchColors={matchColorsLeft}
      />

      <ResultColumn
        side="Right"
        env={rightEnv}
        onEnvChange={onRightEnvChange}
        searchResults={rightResults.searchResults}
        error={rightResults.error}
        queryUrl={rightResults.queryUrl}
        missingResults={missingInRight}
        highlightedId={highlightedId}
        onResultHover={setHighlightedId}
        matchColors={matchColorsRight}
      />

      <div>{map(highlightedId)}</div>
    </div>
  );
};
