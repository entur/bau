import { GeocoderVersion, ApiEnvironment } from "../apiHooks/api";
import { useReverse } from "../apiHooks/useReverse";
import { useResultComparison } from "./useResultComparison";
import { ResultColumn } from "./ResultColumn";
import { MapContainerWrapper } from "../map/MapContainerWrapper";
import styles from "./results.module.scss";

interface Props {
  lat: string;
  lon: string;
  environment: ApiEnvironment;
  size?: number;
  layers?: string;
  sources?: string;
  multiModal?: string;
  boundaryCircleRadius?: string;
  v2only?: boolean;
  v2url?: string;
  onPointChange?: (lat: string, lon: string) => void;
}

export const ReverseResults = ({
  lat,
  lon,
  environment,
  size = 30,
  layers,
  sources,
  multiModal,
  boundaryCircleRadius,
  v2only = false,
  v2url,
  onPointChange,
}: Props) => {
  const commonOptions = {
    environment,
    size,
    layers,
    sources,
    multiModal,
    boundaryCircleRadius,
  };

  const resultsV1 = useReverse({
    lat: v2only ? "" : lat,
    lon: v2only ? "" : lon,
    version: GeocoderVersion.V1,
    ...commonOptions,
  });

  const resultsV2 = useReverse({
    lat,
    lon,
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
