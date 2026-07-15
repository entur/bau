import { Env, V3Params } from "../apiHooks/api";
import { useReverse } from "../apiHooks/useReverse";
import { ComparisonLayout } from "./ComparisonLayout";
import { MapContainerWrapper } from "../map/MapContainerWrapper";

interface Props {
  lat: string;
  lon: string;
  leftEnv: Env;
  rightEnv: Env;
  onLeftEnvChange: (env: Env) => void;
  onRightEnvChange: (env: Env) => void;
  size?: number;
  layers?: string;
  sources?: string;
  multiModal?: string;
  boundaryCircleRadius?: string;
  v3?: V3Params;
  onPointChange?: (lat: string, lon: string) => void;
}

export const ReverseResults = ({
  lat,
  lon,
  leftEnv,
  rightEnv,
  onLeftEnvChange,
  onRightEnvChange,
  size = 30,
  layers,
  sources,
  multiModal,
  boundaryCircleRadius,
  v3,
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
    v3,
  };

  const leftResults = useReverse({ env: leftEnv, ...commonOptions });
  const rightResults = useReverse({ env: rightEnv, ...commonOptions });

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
          reversePoint={
            lat && lon
              ? { lat: parseFloat(lat), lon: parseFloat(lon) }
              : undefined
          }
          onReversePointChange={(newLat, newLon) => {
            onPointChange?.(newLat.toString(), newLon.toString());
          }}
        />
      )}
    />
  );
};
