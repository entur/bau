import { GeocoderVersion, ApiEnvironment } from "../apiHooks/api";
import { useAutoComplete } from "../apiHooks/useAutoComplete";
import { useResultComparison } from "./useResultComparison";
import { ResultColumn } from "./ResultColumn";
import { MapContainerWrapper } from "../map/MapContainerWrapper";
import styles from "./results.module.scss";

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
  v2url?: string;
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
  v2url,
  onFocusChange,
}: Props) => {
  const commonOptions = {
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
  };

  const resultsV1 = useAutoComplete({
    searchTerm: v2only ? "" : searchTerm,
    version: GeocoderVersion.V1,
    ...commonOptions,
  });

  const resultsV2 = useAutoComplete({
    searchTerm,
    version: GeocoderVersion.V2,
    v2url,
    ...commonOptions,
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
    resultsV2.searchResults.results
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
      />

      <div>
        <MapContainerWrapper
          v1Results={resultsV1.searchResults.results}
          v2Results={resultsV2.searchResults.results}
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
