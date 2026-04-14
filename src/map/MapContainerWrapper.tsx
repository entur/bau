import { useState, useEffect, useMemo } from "react";
import { ComparisonMap } from "./ComparisonMap";
import { MapControls } from "./MapControls";
import { MapStatistics } from "./MapStatistics";
import { CategoryFilter } from "./CategoryFilter";
import { Result } from "../apiHooks/response.types";
import styles from "./MapContainerWrapper.module.scss";
import { Heading3 } from "@entur/typography";

interface Props {
  leftResults: Result[];
  rightResults: Result[];
  focusPoint?: { lat: number; lon: number };
  onFocusPointChange?: (lat: number, lon: number) => void;
  reversePoint?: { lat: number; lon: number };
  onReversePointChange?: (lat: number, lon: number) => void;
}

export const MapContainerWrapper = ({
  leftResults,
  rightResults,
  focusPoint,
  onFocusPointChange,
  reversePoint,
  onReversePointChange,
}: Props) => {
  const [showMatched, setShowMatched] = useState(true);
  const [showLeftOnly, setShowLeftOnly] = useState(true);
  const [showRightOnly, setShowRightOnly] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Extract all unique categories from results
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    [...leftResults, ...rightResults].forEach((result) => {
      result.categories.forEach((cat) => categorySet.add(cat));
    });
    return Array.from(categorySet).sort();
  }, [leftResults, rightResults]);

  // Initialize selected categories when categories change
  useEffect(() => {
    setSelectedCategories(allCategories);
  }, [allCategories]);

  // Calculate statistics
  const matchedCount = leftResults.filter((r1) =>
    rightResults.some((r2) => r2.properties.id === r1.properties.id),
  ).length;
  const leftOnlyCount = leftResults.filter(
    (r1) => !rightResults.some((r2) => r2.properties.id === r1.properties.id),
  ).length;
  const rightOnlyCount = rightResults.filter(
    (r2) => !leftResults.some((r1) => r1.properties.id === r2.properties.id),
  ).length;

  // Calculate visible count based on current filters
  const visibleCount = useMemo(() => {
    const categoryFilter = (result: Result) => {
      if (selectedCategories.length === 0) return true;
      return result.categories.some((cat) => selectedCategories.includes(cat));
    };

    let count = 0;
    if (showMatched) {
      count += leftResults.filter(
        (r1) =>
          r1.geometry &&
          categoryFilter(r1) &&
          rightResults.some((r2) => r2.properties.id === r1.properties.id),
      ).length;
    }
    if (showLeftOnly) {
      count += leftResults.filter(
        (r1) =>
          r1.geometry &&
          categoryFilter(r1) &&
          !rightResults.some((r2) => r2.properties.id === r1.properties.id),
      ).length;
    }
    if (showRightOnly) {
      count += rightResults.filter(
        (r2) =>
          r2.geometry &&
          categoryFilter(r2) &&
          !leftResults.some((r1) => r1.properties.id === r2.properties.id),
      ).length;
    }
    return count;
  }, [
    leftResults,
    rightResults,
    showMatched,
    showLeftOnly,
    showRightOnly,
    selectedCategories,
  ]);

  // Show map if there are results with geometry OR if it's interactive (for setting points)
  const hasGeometry =
    leftResults.some((r) => r.geometry) || rightResults.some((r) => r.geometry);
  const isInteractive = !!(onFocusPointChange || onReversePointChange);

  if (!hasGeometry && !isInteractive) {
    return null; // Don't render map if no results and not interactive
  }

  return (
    <div className={styles.mapSection}>
      <Heading3 className={styles.mapHeading}>Geographic Distribution</Heading3>
      <div className={styles.mapLayout}>
        <div className={styles.mapMain}>
          <ComparisonMap
            leftResults={leftResults}
            rightResults={rightResults}
            showMatched={showMatched}
            showLeftOnly={showLeftOnly}
            showRightOnly={showRightOnly}
            selectedCategories={selectedCategories}
            focusPoint={focusPoint}
            onMapClick={onFocusPointChange || onReversePointChange}
            reversePoint={reversePoint}
          />
        </div>
        <div className={styles.mapSidebar}>
          <MapControls
            showMatched={showMatched}
            showLeftOnly={showLeftOnly}
            showRightOnly={showRightOnly}
            onToggleMatched={setShowMatched}
            onToggleLeftOnly={setShowLeftOnly}
            onToggleRightOnly={setShowRightOnly}
          />
          <MapStatistics
            matchedCount={matchedCount}
            leftOnlyCount={leftOnlyCount}
            rightOnlyCount={rightOnlyCount}
            totalLeft={leftResults.length}
            totalRight={rightResults.length}
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
