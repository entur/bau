import styles from "./results.module.scss";
import { ExpandableText } from "@entur/expand";
import { SubParagraph, PreformattedText } from "@entur/typography";
import { ResultIcons } from "./resultIcons";
import { Feature, SearchResults } from "../apiHooks/response.types";
import { WarningIcon } from "@entur/icons";
import { Tooltip } from "@entur/tooltip";

interface Props {
  searchResults?: SearchResults;
  features?: Feature[];
  loading?: boolean;
  error?: any;
  missingResults?: string[];
  highlightedId: string | null;
  onResultHover: (id: string | null) => void;
  matchColors: Map<string, string>;
  onFocusChange: (lat: string, lon: string) => void;
}

const formatDistance = (distanceInKm?: number): string => {
  if (distanceInKm === undefined || distanceInKm === null) {
    return "";
  } else if (distanceInKm < 1) {
    return ` (${Math.round(distanceInKm * 1000)}m)`;
  } else {
    return ` (${Math.round(distanceInKm)}km)`;
  }
};

export const Results = ({
  searchResults,
  features,
  loading,
  error,
  missingResults = [],
  highlightedId,
  onResultHover,
  matchColors,
}: Props) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: "4px",
          padding: "0.75rem",
          marginBottom: "1rem",
          color: "#721c24",
          fontSize: "0.9rem",
        }}
      >
        <strong>⚠️ Endpoint Error:</strong> {error.statusText}
        {error.status > 0 && ` (HTTP ${error.status})`}
      </div>
    );
  }

  const results = searchResults ? searchResults.results : features;

  if (!results) {
    return null;
  }

  return (
    <div>
      {results.map((result, index) => (
        <div
          className={`${styles.resultContainer} ${
            highlightedId === result.properties.id ? styles.highlighted : ""
          }`}
          key={result.properties.id + index}
          onMouseEnter={() => onResultHover(result.properties.id)}
          onMouseLeave={() => onResultHover(null)}
          style={{
            borderLeft: `4px solid ${
              matchColors.get(result.properties.id) || "#9e9e9e"
            }`,
          }}
        >
          {missingResults && (
            <div className={styles.warningContainer}>
              {missingResults.includes(result.properties.id) && (
                <Tooltip
                  content="Dette resultatet mangler på den andre siden"
                  placement="right"
                >
                  <div className={styles.iconsContainer}>
                    <WarningIcon className={styles.warningIcon} />
                  </div>
                </Tooltip>
              )}
            </div>
          )}
          <ResultIcons categories={result.properties.category} />
          <div className={styles.result}>
            <ExpandableText
              title={
                result.properties.name +
                formatDistance(result.properties.distance)
              }
            >
              <div className={styles.resultDetail}>
                <SubParagraph margin="none">
                  Layer: {result.properties.layer}
                </SubParagraph>
                {result.properties.category && (
                  <SubParagraph margin="none">
                    Categories: {result.properties.category.join(", ")}
                  </SubParagraph>
                )}
              </div>
              <PreformattedText>
                {JSON.stringify(result.properties, null, 4)}
              </PreformattedText>
            </ExpandableText>
          </div>
        </div>
      ))}
    </div>
  );
};
