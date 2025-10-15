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
}

export const Results = ({ searchResults, missingResults }: Props) => {
  return (
    <div>
      {" "}
      {searchResults?.results.map((result, index) => (
        <div
          className={styles.resultContainer}
          key={result.properties.id + index}
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
            <ExpandableText title={result.name}>
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
