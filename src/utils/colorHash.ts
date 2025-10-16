/**
 * Generates a consistent color from a string using hash function.
 * Same input always produces same color.
 */
export const hashStringToColor = (str: string): string => {
  const colors = [
    "#4285F4", // Blue
    "#EA4335", // Red
    "#FBBC04", // Yellow
    "#34A853", // Green
    "#FF6D00", // Orange
    "#9C27B0", // Purple
    "#00ACC1", // Cyan
    "#7CB342", // Light green
    "#F4511E", // Deep orange
    "#5E35B1", // Deep purple
    "#00897B", // Teal
    "#C0CA33", // Lime
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Determines match color for a result.
 * Returns generated color if matched, gray if unmatched, red if missing.
 */
export const getMatchColor = (
  resultId: string,
  oppositeResults: { properties: { id: string } }[],
  isMissing: boolean,
): string => {
  if (isMissing) {
    return "#d32f2f"; // Red for missing results
  }

  const hasMatch = oppositeResults.some(
    (r) => r.properties.id === resultId || r.properties.id.includes(resultId),
  );

  return hasMatch ? hashStringToColor(resultId) : "#9e9e9e"; // Gray for unmatched
};
