import { useState, useEffect, useMemo } from "react";
import { ComparisonMap } from "./ComparisonMap";
import { MapControls } from "./MapControls";
import { MapStatistics } from "./MapStatistics";
import { CategoryFilter } from "./CategoryFilter";
import { Result } from "../apiHooks/response.types";
import styles from "./MapContainerWrapper.module.scss";
import { Heading3 } from "@entur/typography";

interface Props {
  v1Results: Result[];
  v2Results: Result[];
  focusPoint?: { lat: number; lon: number };
  onFocusPointChange?: (lat: number, lon: number) => void;
}

export const MapContainerWrapper = ({
  v1Results,
  v2Results,
  focusPoint,
  onFocusPointChange,
}: Props) => {
  const [showMatched, setShowMatched] = useState(true);
  const [showV1Only, setShowV1Only] = useState(true);
  const [showV2Only, setShowV2Only] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Extract all unique categories from results
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    [...v1Results, ...v2Results].forEach((result) => {
      result.categories.forEach((cat) => categorySet.add(cat));
    });
    return Array.from(categorySet).sort();
  }, [v1Results, v2Results]);

  // Initialize selected categories when categories change
  useEffect(() => {
    setSelectedCategories(allCategories);
  }, [allCategories]);

  // Calculate statistics
  const matchedCount = v1Results.filter((r1) =>
    v2Results.some((r2) => r2.properties.id === r1.properties.id),
  ).length;
  const v1OnlyCount = v1Results.filter(
    (r1) => !v2Results.some((r2) => r2.properties.id === r1.properties.id),
  ).length;
  const v2OnlyCount = v2Results.filter(
    (r2) => !v1Results.some((r1) => r1.properties.id === r2.properties.id),
  ).length;

  // Calculate visible count based on current filters
  const visibleCount = useMemo(() => {
    const categoryFilter = (result: Result) => {
      if (selectedCategories.length === 0) return true;
      return result.categories.some((cat) => selectedCategories.includes(cat));
    };

    let count = 0;
    if (showMatched) {
      count += v1Results.filter(
        (r1) =>
          r1.geometry &&
          categoryFilter(r1) &&
          v2Results.some((r2) => r2.properties.id === r1.properties.id),
      ).length;
    }
    if (showV1Only) {
      count += v1Results.filter(
        (r1) =>
          r1.geometry &&
          categoryFilter(r1) &&
          !v2Results.some((r2) => r2.properties.id === r1.properties.id),
      ).length;
    }
    if (showV2Only) {
      count += v2Results.filter(
        (r2) =>
          r2.geometry &&
          categoryFilter(r2) &&
          !v1Results.some((r1) => r1.properties.id === r2.properties.id),
      ).length;
    }
    return count;
  }, [
    v1Results,
    v2Results,
    showMatched,
    showV1Only,
    showV2Only,
    selectedCategories,
  ]);

  // Only show map if there are results with geometry
  const hasGeometry =
    v1Results.some((r) => r.geometry) || v2Results.some((r) => r.geometry);

  if (!hasGeometry) {
    return null; // Don't render map if no results have coordinates
  }

  return (
    <div className={styles.mapSection}>
      <Heading3 className={styles.mapHeading}>Geographic Distribution</Heading3>
      <div className={styles.mapLayout}>
        <div className={styles.mapMain}>
          <ComparisonMap
            v1Results={v1Results}
            v2Results={v2Results}
            showMatched={showMatched}
            showV1Only={showV1Only}
            showV2Only={showV2Only}
            selectedCategories={selectedCategories}
            focusPoint={focusPoint}
            onMapClick={onFocusPointChange}
          />
        </div>
        <div className={styles.mapSidebar}>
          <MapControls
            showMatched={showMatched}
            showV1Only={showV1Only}
            showV2Only={showV2Only}
            onToggleMatched={setShowMatched}
            onToggleV1Only={setShowV1Only}
            onToggleV2Only={setShowV2Only}
          />
          <MapStatistics
            matchedCount={matchedCount}
            v1OnlyCount={v1OnlyCount}
            v2OnlyCount={v2OnlyCount}
            totalV1={v1Results.length}
            totalV2={v2Results.length}
            visibleCount={visibleCount}
          />
          <CategoryFilter
            categories={allCategories}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
          />
        </div>
      </div>
    </div>
  );
};
