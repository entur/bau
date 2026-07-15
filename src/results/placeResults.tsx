import { Env } from "../apiHooks/api";
import { usePlace } from "../apiHooks/usePlace";
import { ComparisonLayout } from "./ComparisonLayout";
import { MapContainerWrapper } from "../map/MapContainerWrapper";

interface Props {
  ids: string;
  leftEnv: Env;
  rightEnv: Env;
  onLeftEnvChange: (env: Env) => void;
  onRightEnvChange: (env: Env) => void;
}

export const PlaceResults = ({
  ids,
  leftEnv,
  rightEnv,
  onLeftEnvChange,
  onRightEnvChange,
}: Props) => {
  const leftResults = usePlace({ ids, env: leftEnv });
  const rightResults = usePlace({ ids, env: rightEnv });

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
        />
      )}
    />
  );
};
