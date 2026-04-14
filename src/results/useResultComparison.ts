import { useEffect, useState, useMemo } from "react";
import { Result } from "../apiHooks/response.types";
import { getMatchColor } from "../utils/colorHash";

export const useResultComparison = (
  leftResults: Result[],
  rightResults: Result[],
  skipComparison = false
) => {
  const [missingInLeft, setMissingInLeft] = useState<string[]>([]);
  const [missingInRight, setMissingInRight] = useState<string[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (skipComparison) {
      setMissingInLeft([]);
      setMissingInRight([]);
      return;
    }

    const leftIds = leftResults.map((r) => r.properties.id);
    const rightIds = rightResults.map((r) => r.properties.id);

    setMissingInLeft(
      leftIds.filter((id) => !rightResults.some((r) => r.properties.id.includes(id)))
    );
    setMissingInRight(
      rightIds.filter((id) => !leftResults.some((r) => r.properties.id.includes(id)))
    );
  }, [leftResults, rightResults, skipComparison]);

  const matchColorsLeft = useMemo(() => {
    if (skipComparison) return new Map<string, string>();
    const colors = new Map<string, string>();
    leftResults.forEach((result) => {
      colors.set(
        result.properties.id,
        getMatchColor(result.properties.id, rightResults, missingInLeft.includes(result.properties.id))
      );
    });
    return colors;
  }, [leftResults, rightResults, missingInLeft, skipComparison]);

  const matchColorsRight = useMemo(() => {
    if (skipComparison) return new Map<string, string>();
    const colors = new Map<string, string>();
    rightResults.forEach((result) => {
      colors.set(
        result.properties.id,
        getMatchColor(result.properties.id, leftResults, missingInRight.includes(result.properties.id))
      );
    });
    return colors;
  }, [leftResults, rightResults, missingInRight, skipComparison]);

  return {
    missingInLeft,
    missingInRight,
    matchColorsLeft,
    matchColorsRight,
    highlightedId,
    setHighlightedId,
  };
};
