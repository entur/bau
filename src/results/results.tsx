import styles from "./results.module.scss";
import { ExpandableText } from "@entur/expand";
import { SubParagraph, PreformattedText } from "@entur/typography";
import { ResultIcons } from "./resultIcons";
import { SearchResults } from "../apiHooks/response.types";
import { WarningIcon } from "@entur/icons";
import { Tooltip } from "@entur/tooltip";

interface Props {
  searchResults: SearchResults;
  missingResults: string[];
  highlightedId: string | null; // NEW: ID of result being hovered
  onResultHover: (id: string | null) => void; // NEW: Hover callback
  matchColors: Map<string, string>; // NEW: Map of ID to color
}

const formatDistance = (distanceInKm?: number): string => {
    if (distanceInKm === undefined || distanceInKm === null) {
        return "";
    } else if (distanceInKm < 1) {
        return ` (${Math.round(distanceInKm * 1000)}m)`;
    } else {
        return ` (${Math.round(distanceInKm)}km)`;
    }
}

export const Results = ({
  searchResults,
  missingResults,
  highlightedId,
  onResultHover,
  matchColors,
}: Props) => {
  return (
    <div>
      {" "}
      {searchResults?.results.map((result, index) => (
        <div
          className={`${styles.resultContainer} ${
            highlightedId === result.properties.id ? styles.highlighted : ""
          }`}
          key={result.properties.id + index}
          onMouseEnter={() => onResultHover(result.properties.id)}
          onMouseLeave={() => onResultHover(null)}
          style={{
            borderLeft: `4px solid ${matchColors.get(result.properties.id) || "#9e9e9e"}`,
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
          <ResultIcons categories={result.categories} />
          <div className={styles.result}>
            <ExpandableText title={result.name + formatDistance(result.properties.distance)}>
              <div className={styles.resultDetail}>
                <SubParagraph margin="none">Layer: {result.layer}</SubParagraph>
                {result.categories && (
                  <SubParagraph margin="none">
                    Categories:{" "}
                    {result.categories
                      .filter(
                        (element, index) =>
                          result.categories.indexOf(element) === index,
                      )
                      .join(", ")}
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
