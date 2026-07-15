import { Env, V3Params } from "../apiHooks/api";
import { useAutoComplete } from "../apiHooks/useAutoComplete";
import { ComparisonLayout } from "./ComparisonLayout";
import { MapContainerWrapper } from "../map/MapContainerWrapper";

interface Props {
  searchTerm: string;
  leftEnv: Env;
  rightEnv: Env;
  onLeftEnvChange: (env: Env) => void;
  onRightEnvChange: (env: Env) => void;
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
  v3?: V3Params;
  onFocusChange?: (lat: string, lon: string) => void;
}

export const AutoCompleteResults = ({
  searchTerm,
  leftEnv,
  rightEnv,
  onLeftEnvChange,
  onRightEnvChange,
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
  v3,
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
    v3,
  };

  const leftResults = useAutoComplete({ env: leftEnv, ...commonOptions });
  const rightResults = useAutoComplete({ env: rightEnv, ...commonOptions });

  return (
    <ComparisonLayout
      leftEnv={leftEnv}
      rightEnv={rightEnv}
      onLeftEnvChange={onLeftEnvChange}
      onRightEnvChange={onRightEnvChange}
      leftResults={leftResults}
      rightResults={rightResults}
      map={(highlightedId) => (
        <MapContainerWrapper
          leftResults={leftResults.searchResults.results}
          rightResults={rightResults.searchResults.results}
          highlightedId={highlightedId}
          focusPoint={
            focusLat && focusLon
              ? { lat: parseFloat(focusLat), lon: parseFloat(focusLon) }
              : undefined
          }
          onFocusPointChange={(lat, lon) => {
            onFocusChange?.(lat.toString(), lon.toString());
          }}
        />
      )}
    />
  );
};
