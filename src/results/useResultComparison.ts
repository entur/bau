import { useEffect, useState, useMemo } from "react";
import { Result } from "../apiHooks/response.types";
import { getMatchColor } from "../utils/colorHash";

export const useResultComparison = (
  v1Results: Result[],
  v2Results: Result[]
) => {
  const [missingInV1, setMissingInV1] = useState<string[]>([]);
  const [missingInV2, setMissingInV2] = useState<string[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const v1Ids = v1Results.map((r) => r.properties.id);
    const v2Ids = v2Results.map((r) => r.properties.id);

    setMissingInV1(
      v1Ids.filter((id) => !v2Results.some((r) => r.properties.id.includes(id)))
    );
    setMissingInV2(
      v2Ids.filter((id) => !v1Results.some((r) => r.properties.id.includes(id)))
    );
  }, [v1Results, v2Results]);

  const matchColorsV1 = useMemo(() => {
    const colors = new Map<string, string>();
    v1Results.forEach((result) => {
      colors.set(
        result.properties.id,
        getMatchColor(result.properties.id, v2Results, missingInV1.includes(result.properties.id))
      );
    });
    return colors;
  }, [v1Results, v2Results, missingInV1]);

  const matchColorsV2 = useMemo(() => {
    const colors = new Map<string, string>();
    v2Results.forEach((result) => {
      colors.set(
        result.properties.id,
        getMatchColor(result.properties.id, v1Results, missingInV2.includes(result.properties.id))
      );
    });
    return colors;
  }, [v1Results, v2Results, missingInV2]);

  return {
    missingInV1,
    missingInV2,
    matchColorsV1,
    matchColorsV2,
    highlightedId,
    setHighlightedId,
  };
};
